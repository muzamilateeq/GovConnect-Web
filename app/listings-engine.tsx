"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  Loader2,
  MapPin,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { fetchListings } from "@/lib/listing-queries";
import {
  categoryNames,
  defaultFilters,
  type DeadlineFilter,
  type Listing,
  type ListingCategory,
  type ListingFilters,
  provinces,
} from "@/lib/listings";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const deadlineOptions: { label: string; value: DeadlineFilter }[] = [
  { label: "All", value: "all" },
  { label: "Closing Today", value: "today" },
  { label: "Closing This Week", value: "week" },
];

export function ListingsEngine({ search }: { search: string }) {
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);
  const [toast, setToast] = useState<Listing | null>(null);
  const queryClient = useQueryClient();

  const effectiveFilters = useMemo(
    () => ({ ...filters, search }),
    [filters, search],
  );

  const listingsQuery = useQuery({
    queryKey: ["listings", effectiveFilters],
    queryFn: () => fetchListings(effectiveFilters),
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const client = supabase;
    const channel = client
      .channel("public-listings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["listings"] });

          if (payload.eventType === "INSERT") {
            setToast(payload.new as Listing);
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [queryClient]);

  const listings = listingsQuery.data ?? [];

  return (
    <section className="px-5 py-16 sm:px-8 lg:px-12" id="listings">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Live Data Engine
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
              Filter jobs, schemes, and results in real time
            </h2>
          </div>
          <div className="flex rounded-full border border-emerald-900/10 bg-white/70 p-1 shadow-lg shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
            {categoryNames.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    category: tab as ListingCategory,
                  }))
                }
                className="relative rounded-full px-4 py-2.5 text-sm font-semibold text-emerald-900/65 transition dark:text-white/65"
              >
                {filters.category === tab && (
                  <motion.span
                    layoutId="active-listing-tab"
                    className="absolute inset-0 rounded-full bg-emerald-700 shadow-md"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={
                    filters.category === tab
                      ? "relative text-white"
                      : "relative hover:text-emerald-900 dark:hover:text-white"
                  }
                >
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <div className="min-h-[420px]">
            <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-emerald-900/10 bg-white/70 px-5 py-4 shadow-lg shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                <Radio className="h-4 w-4" />
                {isSupabaseConfigured
                  ? "Supabase realtime connected"
                  : "Demo data active until Supabase env vars are added"}
              </div>
              {listingsQuery.isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
              )}
            </div>

            {listingsQuery.isError ? (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-red-800">
                {(listingsQuery.error as Error).message}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(effectiveFilters)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.28 }}
                  className="grid gap-5 md:grid-cols-2"
                >
                  {listings.map((listing, index) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {!listingsQuery.isLoading && listings.length === 0 && (
              <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-8 text-center shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                <h3 className="text-xl font-semibold">No listings found</h3>
                <p className="mt-2 text-sm text-emerald-900/65 dark:text-white/65">
                  Try widening the salary, scale, province, or deadline filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-[1.5rem] border border-emerald-300/50 bg-white/90 p-4 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl dark:border-white/10 dark:bg-[#061b12]/95"
          >
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
              New listing published
            </p>
            <h3 className="mt-1 font-semibold">{toast.title}</h3>
            <button
              onClick={() => setToast(null)}
              className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FilterSidebar({
  filters,
  setFilters,
}: {
  filters: ListingFilters;
  setFilters: Dispatch<SetStateAction<ListingFilters>>;
}) {
  return (
    <aside className="h-fit rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-5 shadow-xl shadow-emerald-950/7 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <SlidersHorizontal className="h-5 w-5" />
          Advanced filters
        </h3>
        <button
          onClick={() => setFilters(defaultFilters)}
          className="text-sm font-semibold text-emerald-700 dark:text-emerald-200"
        >
          Reset
        </button>
      </div>

      <RangeFilter
        label="Salary range"
        prefix="PKR "
        min={0}
        max={450000}
        step={5000}
        value={filters.salary}
        onChange={(salary) => setFilters((current) => ({ ...current, salary }))}
      />

      <RangeFilter
        label="BPS scale"
        min={1}
        max={22}
        step={1}
        value={filters.bps}
        onChange={(bps) => setFilters((current) => ({ ...current, bps }))}
      />

      <div className="mt-7">
        <p className="text-sm font-semibold text-emerald-950 dark:text-white">
          Provinces
        </p>
        <div className="mt-3 space-y-2">
          {provinces.map((province) => {
            const checked = filters.provinces.includes(province);

            return (
              <label
                key={province}
                className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-emerald-900/70 transition hover:bg-emerald-50 dark:text-white/70 dark:hover:bg-white/10"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    checked
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-emerald-900/20 bg-white/60 dark:border-white/15 dark:bg-white/5"
                  }`}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setFilters((current) => ({
                      ...current,
                      provinces: checked
                        ? current.provinces.filter((item) => item !== province)
                        : [...current.provinces, province],
                    }))
                  }
                  className="sr-only"
                />
                {province}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <p className="text-sm font-semibold text-emerald-950 dark:text-white">
          Deadlines
        </p>
        <div className="mt-3 grid gap-2">
          {deadlineOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  deadline: option.value,
                }))
              }
              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                filters.deadline === option.value
                  ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/15"
                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function RangeFilter({
  label,
  min,
  max,
  step,
  value,
  onChange,
  prefix = "",
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  prefix?: string;
}) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-emerald-950 dark:text-white">
          {label}
        </p>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
          {prefix}
          {value[0].toLocaleString()} - {prefix}
          {value[1].toLocaleString()}
        </p>
      </div>
      <div className="space-y-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(event) =>
            onChange([Math.min(Number(event.target.value), value[1]), value[1]])
          }
          className="w-full accent-emerald-700"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(event) =>
            onChange([value[0], Math.max(Number(event.target.value), value[0])])
          }
          className="w-full accent-emerald-700"
        />
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  index,
}: {
  listing: Listing;
  index: number;
}) {
  const isScheme = listing.category === "New Schemes";

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-6 shadow-xl shadow-emerald-950/7 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {listing.organization}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-900/55 dark:text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}, {listing.province}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-white/10 dark:text-emerald-100">
          {listing.category}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-semibold">{listing.title}</h3>
      <p className="mt-3 text-sm leading-6 text-emerald-900/65 dark:text-white/65">
        {listing.summary}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-white/10">
          <p className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
            {isScheme ? "Benefit" : "Salary"}
          </p>
          <p className="mt-1 font-semibold">
            {isScheme
              ? "Eligibility based"
              : `PKR ${listing.salary_min.toLocaleString()} - ${listing.salary_max.toLocaleString()}`}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-white/10">
          <p className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
            Scale
          </p>
          <p className="mt-1 font-semibold">
            BPS {listing.bps_min}-{listing.bps_max}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-emerald-900/10 pt-5 dark:border-white/10">
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
          <CalendarClock className="h-4 w-4" />
          {new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(listing.apply_deadline))}
        </span>
        <Link
          href={`/listings/${listing.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 dark:text-emerald-100"
        >
          View
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
