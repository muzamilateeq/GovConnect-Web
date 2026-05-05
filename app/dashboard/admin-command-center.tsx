"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  FileText,
  ImageDown,
  Laptop,
  LinkIcon,
  Loader2,
  Megaphone,
  Play,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { mockListings, type Listing } from "@/lib/listings";

type DraftPost = {
  scrapeUrl: string;
  title: string;
  organization: string;
  description: string;
  category: "Latest Jobs" | "New Schemes";
  deadline: string;
};

type ScraperLog = {
  id: string;
  source_name: string;
  status: "success" | "error";
  scanned_at: string;
  inserted_count: number;
  updated_count: number;
  message: string;
};

const expiredSeed: Listing[] = [
  {
    ...mockListings[0],
    id: "expired-ppsc-old",
    slug: "ppsc-office-assistant-expired",
    title: "Office Assistant Batch 2025",
    apply_deadline: "2026-04-20",
  },
  {
    ...mockListings[3],
    id: "expired-data-old",
    slug: "data-entry-operator-expired",
    title: "Data Entry Operator Hiring",
    apply_deadline: "2026-04-28",
  },
  {
    ...mockListings[1],
    id: "expired-laptop-old",
    slug: "laptop-scheme-legacy-expired",
    title: "Laptop Scheme Legacy Verification",
    apply_deadline: "2026-04-30",
  },
];

const viewedPosts = [
  ["Laptop Scheme 2026 Phase One", 18420],
  ["Assistant Director Recruitment 2026", 15880],
  ["Educator Merit List 2026", 11210],
  ["Green Solar Support Program", 9640],
];

const initialDraft: DraftPost = {
  scrapeUrl: "",
  title: "",
  organization: "",
  description: "",
  category: "Latest Jobs",
  deadline: "2026-06-30",
};

export function AdminCommandCenter() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DraftPost>(initialDraft);
  const [scraping, setScraping] = useState(false);
  const [expiredJobs, setExpiredJobs] = useState(expiredSeed);
  const [selected, setSelected] = useState<string[]>([]);
  const [socialStatus, setSocialStatus] = useState("Ready");
  const [scraperStatus, setScraperStatus] = useState("Idle");
  const [runningScraper, setRunningScraper] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analytics = useMemo(
    () => ({
      activeJobs: mockListings.filter((item) => item.category === "Latest Jobs")
        .length,
      laptopSchemes: mockListings.filter((item) =>
        item.title.toLowerCase().includes("laptop"),
      ).length,
      mostViewed: viewedPosts[0][1].toLocaleString(),
    }),
    [],
  );

  const scraperLogsQuery = useQuery({
    queryKey: ["scraper-logs"],
    queryFn: async () => {
      const response = await fetch("/api/admin/scraper/logs");
      if (!response.ok) return [];

      const payload = (await response.json()) as { logs: ScraperLog[] };
      return payload.logs ?? [];
    },
  });

  async function runScraperNow() {
    setRunningScraper(true);
    setScraperStatus("Running official source scan...");

    try {
      const response = await fetch("/api/admin/scraper/run", {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Scraper failed");
      }

      setScraperStatus(
        `Done: ${payload.inserted} inserted, ${payload.updated} updated, ${payload.errors} source errors`,
      );
      await scraperLogsQuery.refetch();
    } catch (error) {
      setScraperStatus(error instanceof Error ? error.message : "Scraper failed");
    } finally {
      setRunningScraper(false);
    }
  }

  async function simulateScrape() {
    if (!draft.scrapeUrl.trim()) return;

    setScraping(true);
    await new Promise((resolve) => setTimeout(resolve, 850));

    const isLaptop = draft.scrapeUrl.toLowerCase().includes("laptop");
    setDraft((current) => ({
      ...current,
      title: isLaptop
        ? "Laptop Scheme 2026 Student Verification"
        : "Assistant Director Recruitment 2026",
      organization: isLaptop
        ? "Higher Education Department"
        : "Punjab Public Service Commission",
      category: isLaptop ? "New Schemes" : "Latest Jobs",
      description: isLaptop
        ? "Official scheme notice detected. Eligible students can submit records for verification, merit review, and phase-wise distribution tracking."
        : "Official recruitment notice detected. Candidates can review eligibility, syllabus, test schedule, document requirements, and application instructions.",
    }));
    setScraping(false);
    setStep(2);
  }

  function applyBulkAction(action: "archive" | "delete") {
    if (selected.length === 0) return;

    setExpiredJobs((current) =>
      action === "delete"
        ? current.filter((item) => !selected.includes(item.id))
        : current.map((item) =>
            selected.includes(item.id)
              ? { ...item, title: `[Archived] ${item.title}` }
              : item,
          ),
    );
    setSelected([]);
  }

  function drawSocialImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = 1200;
    canvas.height = 630;

    context.fillStyle = "#052e1b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0f5132";
    context.fillRect(760, 0, 440, 630);
    context.fillStyle = "#d9f99d";
    context.beginPath();
    context.roundRect(72, 64, 310, 58, 29);
    context.fill();

    context.fillStyle = "#14532d";
    context.font = "700 28px Arial";
    context.fillText("GovConnect Verified", 102, 101);

    context.fillStyle = "#ffffff";
    context.font = "800 72px Arial";
    wrapText(context, draft.title || "New Government Opportunity", 72, 240, 820, 80);

    context.fillStyle = "#bbf7d0";
    context.font = "600 34px Arial";
    context.fillText(draft.organization || "Public Services Department", 72, 430);

    context.fillStyle = "#ecfdf5";
    context.font = "500 28px Arial";
    context.fillText(`Deadline: ${draft.deadline}`, 72, 506);
    context.fillText("Apply through the official portal", 72, 552);

    context.fillStyle = "#ffffff";
    context.font = "800 48px Arial";
    context.fillText(draft.category, 810, 326);

    setSocialStatus("Job ad image generated for WhatsApp/Facebook sharing");
  }

  return (
    <main className="min-h-screen bg-[#f8fbf8] px-5 py-8 text-emerald-950 dark:bg-[#03140d] dark:text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Protected Admin Route
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">
                Admin Command Center
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-900/65 dark:text-white/65">
                Publish listings, monitor portal performance, moderate expired
                posts, and generate social-ready job creatives from one secured
                console.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-emerald-950 p-5 text-white shadow-xl shadow-emerald-950/15">
              <p className="text-sm text-emerald-100/70">Session status</p>
              <p className="mt-2 text-2xl font-semibold">Supabase Protected</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <MetricCard
            icon={<BriefcaseBusiness className="h-6 w-6" />}
            label="Total Active Jobs"
            value={analytics.activeJobs.toString()}
          />
          <MetricCard
            icon={<Laptop className="h-6 w-6" />}
            label="Total Laptop Schemes"
            value={analytics.laptopSchemes.toString()}
          />
          <MetricCard
            icon={<BarChart3 className="h-6 w-6" />}
            label="Top Post Views"
            value={analytics.mostViewed}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SmartForm
            draft={draft}
            scraping={scraping}
            setDraft={setDraft}
            simulateScrape={simulateScrape}
            step={step}
            setStep={setStep}
          />
          <AnalyticsPanel />
        </section>

        <section className="mt-6">
          <ScraperLogPanel
            logs={scraperLogsQuery.data ?? []}
            running={runningScraper}
            runScraperNow={runScraperNow}
            scraperStatus={scraperStatus}
            refresh={() => {
              scraperLogsQuery.refetch();
            }}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <BulkActions
            expiredJobs={expiredJobs}
            selected={selected}
            setSelected={setSelected}
            applyBulkAction={applyBulkAction}
          />
          <SocialBot
            canvasRef={canvasRef}
            draft={draft}
            drawSocialImage={drawSocialImage}
            socialStatus={socialStatus}
          />
        </section>
      </div>
    </main>
  );
}

function ScraperLogPanel({
  logs,
  running,
  runScraperNow,
  scraperStatus,
  refresh,
}: {
  logs: ScraperLog[];
  running: boolean;
  runScraperNow: () => void;
  scraperStatus: string;
  refresh: () => void;
}) {
  const fallbackLogs: ScraperLog[] = [
    {
      id: "demo-fpsc",
      source_name: "FPSC",
      status: "success",
      scanned_at: new Date().toISOString(),
      inserted_count: 2,
      updated_count: 0,
      message: "Scanned FPSC - 2 New Jobs Found",
    },
    {
      id: "demo-spsc",
      source_name: "SPSC",
      status: "error",
      scanned_at: new Date().toISOString(),
      inserted_count: 0,
      updated_count: 0,
      message: "Scanned SPSC - error: source timeout",
    },
  ];
  const visibleLogs = logs.length > 0 ? logs : fallbackLogs;

  return (
    <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <RefreshCcw className="h-6 w-6" />
            Scraper log
          </h2>
          <p className="mt-2 text-sm text-emerald-900/60 dark:text-white/60">
            {scraperStatus}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-white/10 dark:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={runScraperNow}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Scraper Now
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {visibleLogs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl bg-emerald-50 p-4 dark:bg-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{log.source_name}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  log.status === "success"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {log.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-emerald-900/70 dark:text-white/70">
              {log.message}
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-900/45 dark:text-white/45">
              {new Intl.DateTimeFormat("en", {
                hour: "numeric",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              }).format(new Date(log.scanned_at))}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
    >
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
        {icon}
      </div>
      <p className="mt-6 text-sm font-semibold text-emerald-900/55 dark:text-white/55">
        {label}
      </p>
      <p className="mt-2 text-4xl font-semibold">{value}</p>
    </motion.article>
  );
}

function SmartForm({
  draft,
  scraping,
  setDraft,
  simulateScrape,
  step,
  setStep,
}: {
  draft: DraftPost;
  scraping: boolean;
  setDraft: React.Dispatch<React.SetStateAction<DraftPost>>;
  simulateScrape: () => void;
  step: number;
  setStep: (step: number) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <ClipboardList className="h-6 w-6" />
            Smart job posting form
          </h2>
          <p className="mt-2 text-sm text-emerald-900/60 dark:text-white/60">
            Multi-step publishing with simulated official-link autofill.
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((item) => (
            <button
              key={item}
              onClick={() => setStep(item)}
              className={`h-9 w-9 rounded-full text-sm font-semibold ${
                step === item
                  ? "bg-emerald-800 text-white"
                  : "bg-emerald-50 text-emerald-800 dark:bg-white/10 dark:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {step === 1 && (
          <div>
            <label className="text-sm font-semibold">Scrape Link</label>
            <div className="mt-2 flex gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 dark:border-white/10 dark:bg-white/10">
                <LinkIcon className="h-4 w-4 shrink-0 text-emerald-700" />
                <input
                  value={draft.scrapeUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      scrapeUrl: event.target.value,
                    }))
                  }
                  placeholder="https://official.gov.pk/jobs/notice"
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <button
                onClick={simulateScrape}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-800 px-5 text-sm font-semibold text-white"
              >
                {scraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Autofill
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <Field
              label="Title"
              value={draft.title}
              onChange={(value) =>
                setDraft((current) => ({ ...current, title: value }))
              }
            />
            <Field
              label="Organization"
              value={draft.organization}
              onChange={(value) =>
                setDraft((current) => ({ ...current, organization: value }))
              }
            />
            <label className="text-sm font-semibold">
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 min-h-32 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4 text-sm outline-none dark:border-white/10 dark:bg-white/10"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Category
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as DraftPost["category"],
                  }))
                }
                className="mt-2 h-12 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 outline-none dark:border-white/10 dark:bg-white/10"
              >
                <option>Latest Jobs</option>
                <option>New Schemes</option>
              </select>
            </label>
            <Field
              label="Apply Deadline"
              type="date"
              value={draft.deadline}
              onChange={(value) =>
                setDraft((current) => ({ ...current, deadline: value }))
              }
            />
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-white/10 sm:col-span-2">
              <p className="text-sm font-semibold">Review</p>
              <p className="mt-2 text-sm text-emerald-900/65 dark:text-white/65">
                {draft.title || "Untitled post"} will be prepared as{" "}
                {draft.category} for {draft.organization || "an organization"}.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 text-sm outline-none dark:border-white/10 dark:bg-white/10"
      />
    </label>
  );
}

function AnalyticsPanel() {
  return (
    <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <h2 className="flex items-center gap-2 text-2xl font-semibold">
        <BarChart3 className="h-6 w-6" />
        Most-viewed posts
      </h2>
      <div className="mt-6 space-y-4">
        {viewedPosts.map(([title, views], index) => (
          <div key={title}>
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>{title}</span>
              <span>{views.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-emerald-100 dark:bg-white/10">
              <div
                className="h-3 rounded-full bg-emerald-700"
                style={{ width: `${92 - index * 14}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BulkActions({
  expiredJobs,
  selected,
  setSelected,
  applyBulkAction,
}: {
  expiredJobs: Listing[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  applyBulkAction: (action: "archive" | "delete") => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <FileText className="h-6 w-6" />
            Expired jobs
          </h2>
          <p className="mt-2 text-sm text-emerald-900/60 dark:text-white/60">
            Select multiple expired posts for bulk moderation.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => applyBulkAction("archive")}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-white/10 dark:text-white"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
          <button
            onClick={() => applyBulkAction("delete")}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {expiredJobs.map((job) => {
          const checked = selected.includes(job.id);
          return (
            <button
              key={job.id}
              onClick={() =>
                setSelected((current) =>
                  checked
                    ? current.filter((item) => item !== job.id)
                    : [...current, job.id],
                )
              }
              className="flex w-full items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-4 text-left transition hover:bg-emerald-100 dark:bg-white/10 dark:hover:bg-white/15"
            >
              <span>
                <span className="block font-semibold">{job.title}</span>
                <span className="mt-1 block text-sm text-emerald-900/55 dark:text-white/55">
                  Expired {job.apply_deadline}
                </span>
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                  checked
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-emerald-900/20 bg-white/70 dark:border-white/15 dark:bg-white/5"
                }`}
              >
                {checked && <Check className="h-4 w-4" />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SocialBot({
  canvasRef,
  draft,
  drawSocialImage,
  socialStatus,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  draft: DraftPost;
  drawSocialImage: () => void;
  socialStatus: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Megaphone className="h-6 w-6" />
            Social sharing bot
          </h2>
          <p className="mt-2 text-sm text-emerald-900/60 dark:text-white/60">
            Generate a professional job ad image from the draft.
          </p>
        </div>
        <button
          onClick={drawSocialImage}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white"
        >
          <Share2 className="h-4 w-4" />
          Share to Social Media
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-5 aspect-[1200/630] w-full rounded-[1.5rem] bg-emerald-950 shadow-inner"
      />
      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-100">
        <ImageDown className="h-4 w-4" />
        {socialStatus}: {draft.title || "Use the smart form to create a post"}
      </div>
    </section>
  );
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line !== "") {
      context.fillText(line, x, lineY);
      line = `${word} `;
      lineY += lineHeight;
      return;
    }

    line = testLine;
  });

  context.fillText(line, x, lineY);
}
