import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import { SOURCE_CONFIGS, USER_AGENT } from "./scraper-config.mjs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCRAPER_LIMIT = Number(process.env.SCRAPER_LIMIT ?? "8");
const AD_BUCKET = process.env.SUPABASE_AD_BUCKET ?? "listing-ads";
const SCRAPER_RENDERER = process.env.SCRAPER_RENDERER ?? "cheerio";

const scraperOptions = {
  headers: {
    "user-agent": USER_AGENT,
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9,ur;q=0.8",
    "cache-control": "no-cache",
  },
};

function requireEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
}

function getSupabase() {
  requireEnv();
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

function initFirebase() {
  if (admin.apps.length > 0) return admin.apps[0];

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) return null;

  return admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });
}

function absoluteUrl(value, baseUrl) {
  if (!value) return null;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  const hash = createHash("sha1").update(value).digest("hex").slice(0, 8);
  return `${base || "listing"}-${hash}`;
}

function defaultDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 21);
  return date.toISOString().slice(0, 10);
}

function extractDeadline(text) {
  const match =
    text.match(/\b(\d{1,2})[-/. ]([A-Za-z]{3,9}|\d{1,2})[-/. ](\d{2,4})\b/) ??
    text.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);

  if (!match) return defaultDeadline();

  const parsed = new Date(match[0]);
  if (Number.isNaN(parsed.getTime())) return defaultDeadline();

  return parsed.toISOString().slice(0, 10);
}

function detectUpdateType(text) {
  const lower = text.toLowerCase();

  if (lower.includes("deadline") && lower.includes("extend")) {
    return "Deadline Extension";
  }

  if (lower.includes("corrigendum") || lower.includes("new update")) {
    return "New Update";
  }

  return null;
}

function candidateSelector($) {
  const selectors = [
    "article",
    ".news-item",
    ".views-row",
    ".job",
    ".jobs",
    ".card",
    ".item",
    "li",
    "tr",
  ];

  const candidates = [];
  selectors.forEach((selector) => {
    $(selector).each((_, element) => {
      const text = cleanText($(element).text());
      if (text.length > 24) candidates.push(element);
    });
  });

  return candidates.slice(0, SCRAPER_LIMIT);
}

function extractListingsFromHtml(html, source) {
  const $ = cheerio.load(html);
  const candidates = candidateSelector($);
  const records = [];

  candidates.forEach((element) => {
    const node = $(element);
    const text = cleanText(node.text());
    const title =
      cleanText(node.find("h1,h2,h3,h4,a,strong").first().text()) ||
      text.slice(0, 120);

    if (title.length < 8) return;

    const officialUrl =
      absoluteUrl(node.find("a[href]").first().attr("href"), source.url) ??
      source.url;
    const pdfUrl =
      absoluteUrl(
        node.find('a[href$=".pdf"],a[href*=".pdf"]').first().attr("href"),
        source.url,
      ) ??
      findPdfUrl($, source.url);
    const imageUrl =
      absoluteUrl(node.find("img[src]").first().attr("src"), source.url) ??
      findImageUrl($, source.url);

    const description =
      text.length > 280
        ? `${text.slice(0, 277).trim()}...`
        : text || `${source.name} official listing`;

    records.push({
      source_key: source.key,
      source_name: source.name,
      title,
      slug: slugify(`${source.key}-${officialUrl}-${title}`),
      organization: source.organization,
      city: source.city,
      province: source.province,
      category: source.category,
      official_url: officialUrl,
      source_url: source.url,
      pdf_url: pdfUrl,
      source_image_url: imageUrl,
      ad_image_url: imageUrl,
      salary_min: 0,
      salary_max: 0,
      bps_min: 1,
      bps_max: 22,
      apply_deadline: extractDeadline(text),
      summary: text.slice(0, 160) || title,
      description,
      apply_url: officialUrl,
      is_published: true,
      update_type: detectUpdateType(text),
      raw_hash: createHash("sha256").update(text).digest("hex"),
    });
  });

  return dedupe(records);
}

function findPdfUrl($, baseUrl) {
  const href = $('a[href$=".pdf"],a[href*=".pdf"]').first().attr("href");
  return absoluteUrl(href, baseUrl);
}

function findImageUrl($, baseUrl) {
  const src = $("img").first().attr("src");
  return absoluteUrl(src, baseUrl);
}

function dedupe(records) {
  const seen = new Set();

  return records.filter((record) => {
    const key = record.official_url || record.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchHtml(source) {
  if (SCRAPER_RENDERER === "puppeteer") {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.setExtraHTTPHeaders({
        "accept-language": "en-US,en;q=0.9,ur;q=0.8",
      });
      await page.goto(source.url, {
        waitUntil: "networkidle2",
        timeout: 45_000,
      });

      return await page.content();
    } finally {
      await browser.close();
    }
  }

  const response = await fetch(source.url, scraperOptions);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${source.url}`);
  }

  return response.text();
}

async function uploadImageIfAvailable(supabase, record) {
  if (!record.source_image_url) return record.ad_image_url;

  try {
    const response = await fetch(record.source_image_url, scraperOptions);
    if (!response.ok) return record.ad_image_url;

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return record.ad_image_url;

    const bytes = new Uint8Array(await response.arrayBuffer());
    const ext = contentType.includes("png") ? "png" : "jpg";
    const path = `${record.source_key}/${record.slug}.${ext}`;

    const { error } = await supabase.storage
      .from(AD_BUCKET)
      .upload(path, bytes, {
        contentType,
        upsert: true,
      });

    if (error) return record.ad_image_url;

    const { data } = supabase.storage.from(AD_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return record.ad_image_url;
  }
}

async function notifyNewListing(record) {
  const app = initFirebase();
  if (!app) return;

  await admin.messaging().send({
    topic: "portal-listings",
    notification: {
      title: `New ${record.category}`,
      body: record.title,
    },
    webpush: {
      fcmOptions: {
        link: record.apply_url,
      },
    },
    data: {
      slug: record.slug,
      source: record.source_name,
    },
  });
}

async function upsertRecord(supabase, record) {
  let { data: existing, error: lookupError } = await supabase
    .from("listings")
    .select("id, raw_hash, apply_deadline, official_url, title")
    .eq("official_url", record.official_url)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (!existing) {
    const fallback = await supabase
      .from("listings")
      .select("id, raw_hash, apply_deadline, official_url, title")
      .eq("slug", record.slug)
      .maybeSingle();

    if (fallback.error) throw fallback.error;
    existing = fallback.data;
  }

  const adImageUrl = await uploadImageIfAvailable(supabase, record);
  const payload = {
    slug: existing?.id ? undefined : record.slug,
    title: record.title,
    organization: record.organization,
    organization_logo_url: null,
    salary_min: record.salary_min,
    salary_max: record.salary_max,
    bps_min: record.bps_min,
    bps_max: record.bps_max,
    city: record.city,
    province: record.province,
    category: record.category,
    apply_deadline: record.apply_deadline,
    summary: record.summary,
    description: record.description,
    apply_url: record.apply_url,
    official_url: record.official_url,
    source_key: record.source_key,
    source_name: record.source_name,
    source_url: record.source_url,
    source_image_url: record.source_image_url,
    ad_image_url: adImageUrl,
    pdf_url: record.pdf_url,
    raw_hash: record.raw_hash,
    update_type: record.update_type,
    last_scraped_at: new Date().toISOString(),
    click_count: existing?.id ? undefined : 0,
    is_published: true,
  };

  if (existing?.id) {
    if (
      existing.raw_hash === record.raw_hash &&
      existing.apply_deadline === record.apply_deadline
    ) {
      return "unchanged";
    }

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", existing.id);

    if (error) throw error;
    return record.update_type === "Deadline Extension" ? "extended" : "updated";
  }

  const { error } = await supabase.from("listings").insert({
    ...payload,
    slug: record.slug,
  });

  if (error) throw error;

  await notifyNewListing(record);
  return "inserted";
}

async function writeLog(supabase, log) {
  await supabase.from("scraper_logs").insert(log);
}

async function scrapeSource(supabase, source) {
  const startedAt = Date.now();
  const log = {
    source_key: source.key,
    source_name: source.name,
    status: "success",
    scanned_at: new Date().toISOString(),
    found_count: 0,
    inserted_count: 0,
    updated_count: 0,
    error_message: null,
    message: "",
    duration_ms: 0,
  };

  try {
    const html = await fetchHtml(source);
    const records = extractListingsFromHtml(html, source);
    log.found_count = records.length;

    for (const record of records) {
      const result = await upsertRecord(supabase, record);
      if (result === "inserted") log.inserted_count += 1;
      if (result === "updated" || result === "extended") log.updated_count += 1;
    }

    log.message = `Scanned ${source.name} - ${log.inserted_count} New Jobs Found`;
  } catch (error) {
    log.status = "error";
    log.error_message = error instanceof Error ? error.message : String(error);
    log.message = `Scanned ${source.name} - error: ${log.error_message}`;
  } finally {
    log.duration_ms = Date.now() - startedAt;
    await writeLog(supabase, log);
  }

  return log;
}

export async function runScraper() {
  const supabase = getSupabase();
  const results = [];

  for (const source of SOURCE_CONFIGS) {
    const result = await scrapeSource(supabase, source);
    results.push(result);
  }

  return {
    ok: true,
    scanned: results.length,
    inserted: results.reduce((sum, item) => sum + item.inserted_count, 0),
    updated: results.reduce((sum, item) => sum + item.updated_count, 0),
    errors: results.filter((item) => item.status === "error").length,
    results,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runScraper()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.errors === result.scanned ? 1 : 0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
