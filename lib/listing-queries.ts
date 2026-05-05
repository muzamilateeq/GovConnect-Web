import { cache } from "react";
import {
  defaultFilters,
  type DeadlineFilter,
  type Listing,
  type ListingFilters,
  mockListings,
} from "@/lib/listings";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function getDeadlineRange(filter: DeadlineFilter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today);

  if (filter === "today") {
    end.setDate(today.getDate() + 1);
  }

  if (filter === "week") {
    end.setDate(today.getDate() + 7);
  }

  return {
    start: today.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function matchesDeadline(date: string, filter: DeadlineFilter) {
  if (filter === "all") return true;

  const { start, end } = getDeadlineRange(filter);
  return filter === "today"
    ? date >= start && date < end
    : date >= start && date <= end;
}

function getSearchTokens(search: string) {
  const synonyms: Record<string, string> = {
    leptop: "laptop",
    labtop: "laptop",
    laaptop: "laptop",
    laptope: "laptop",
    scheem: "scheme",
    screem: "scheme",
    sceem: "scheme",
    sceme: "scheme",
    skim: "scheme",
    skeme: "scheme",
    scolarship: "scholarship",
    scholership: "scholarship",
    licens: "license",
    licence: "license",
    polices: "police",
    kassan: "kissan",
    kisan: "kissan",
    kissan: "kissan",
    cark: "card",
  };
  const genericWords = new Set([
    "job",
    "jobs",
    "scheme",
    "schemes",
    "service",
    "services",
    "portal",
    "apply",
    "official",
  ]);

  const tokens = search
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .map((token) => synonyms[token] ?? token)
    .filter((token) => token.length > 1 && !genericWords.has(token));

  const uniqueTokens = [...new Set(tokens)];

  return uniqueTokens.length > 0 ? uniqueTokens : [search.trim().toLowerCase()];
}

function listingSearchHaystack(listing: Listing) {
  return [
    listing.title,
    listing.organization,
    listing.source_key ?? "",
    listing.source_name ?? "",
    listing.city,
    listing.province,
    listing.summary,
    listing.description,
    listing.official_url ?? "",
    listing.official_link ?? "",
    listing.apply_url ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function matchesSearch(listing: Listing, search: string) {
  if (!search.trim()) return true;

  const haystack = listingSearchHaystack(listing);
  const tokens = getSearchTokens(search);

  return tokens.every((token) => haystack.includes(token));
}

function searchMockListings(filters: ListingFilters) {
  return mockListings
    .filter((listing) => listing.is_published)
    .filter(
      (listing) =>
        filters.category === "All" || listing.category === filters.category,
    )
    .filter((listing) => matchesSearch(listing, filters.search))
    .filter(
      (listing) =>
        filters.category !== "Latest Jobs" ||
        listing.salary_min <= filters.salary[1] &&
        listing.salary_max >= filters.salary[0],
    )
    .filter(
      (listing) =>
        listing.bps_min <= filters.bps[1] && listing.bps_max >= filters.bps[0],
    )
    .filter(
      (listing) =>
        filters.provinces.length === 0 ||
        filters.provinces.includes(listing.province),
    )
    .filter((listing) => matchesDeadline(listing.apply_deadline, filters.deadline))
    .sort((a, b) => a.apply_deadline.localeCompare(b.apply_deadline));
}

export async function fetchListings(filters: ListingFilters) {
  if (!isSupabaseConfigured || !supabase) {
    return searchMockListings(filters);
  }

  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_published", true)
    .lte("bps_min", filters.bps[1])
    .gte("bps_max", filters.bps[0])
    .order("apply_deadline", { ascending: true });

  if (filters.category !== "All") {
    query = query.eq("category", filters.category);
  }

  if (filters.category === "Latest Jobs") {
    query = query
      .lte("salary_min", filters.salary[1])
      .gte("salary_max", filters.salary[0]);
  }

  if (filters.search.trim()) {
    const tokens = getSearchTokens(filters.search);
    tokens.forEach((token) => {
      const safeToken = token.replace(/[%_,]/g, " ");
      query = query.or(
        [
          `title.ilike.%${safeToken}%`,
          `organization.ilike.%${safeToken}%`,
          `source_key.ilike.%${safeToken}%`,
          `source_name.ilike.%${safeToken}%`,
          `summary.ilike.%${safeToken}%`,
          `description.ilike.%${safeToken}%`,
          `city.ilike.%${safeToken}%`,
          `province.ilike.%${safeToken}%`,
        ].join(","),
      );
    });
  }

  if (filters.provinces.length > 0) {
    query = query.in("province", filters.provinces);
  }

  if (filters.deadline !== "all") {
    const { start, end } = getDeadlineRange(filters.deadline);
    query = query.gte("apply_deadline", start);
    query =
      filters.deadline === "today"
        ? query.lt("apply_deadline", end)
        : query.lte("apply_deadline", end);
  }

  const { data, error } = await query.returns<Listing[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.filter((listing) => matchesSearch(listing, filters.search));
}

export const getListingBySlug = cache(async (slug: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return mockListings.find((listing) => listing.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<Listing>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
});

export const initialListingFilters = defaultFilters;
