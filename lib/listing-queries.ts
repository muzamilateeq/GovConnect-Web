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
    .filter((token) => token.length > 1 && !genericWords.has(token));

  return tokens.length > 0 ? tokens : [search.trim().toLowerCase()];
}

function searchMockListings(filters: ListingFilters) {
  const tokens = getSearchTokens(filters.search);

  return mockListings
    .filter((listing) => listing.is_published)
    .filter(
      (listing) =>
        filters.category === "All" || listing.category === filters.category,
    )
    .filter((listing) => {
      if (!filters.search.trim()) return true;

      const haystack = [
        listing.title,
        listing.organization,
        listing.source_key ?? "",
        listing.source_name ?? "",
        listing.city,
        listing.province,
        listing.summary,
      ]
        .join(" ")
        .toLowerCase();

      return tokens.some((token) => haystack.includes(token));
    })
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
    const fields = [
      "title",
      "organization",
      "source_key",
      "source_name",
      "summary",
      "city",
      "province",
    ];

    query = query.or(
      tokens
        .flatMap((token) =>
          fields.map((field) => `${field}.ilike.%${token.replaceAll(",", " ")}%`),
        )
        .join(","),
    );
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

  return data;
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
