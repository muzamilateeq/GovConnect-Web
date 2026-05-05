"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import type { Listing } from "@/lib/listings";
import { ApplyNowButton } from "./apply-now-button";

export function ListingCard({
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
      className="group rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-4 shadow-xl shadow-emerald-950/7 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl sm:p-6 dark:border-white/10 dark:bg-white/10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {listing.source_name ?? listing.organization}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-900/55 dark:text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}, {listing.province}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-white/10 dark:text-emerald-100">
          {listing.category}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold sm:mt-6 sm:text-xl">{listing.title}</h3>
      <p className="mt-3 text-sm leading-6 text-emerald-900/65 dark:text-white/65">
        {listing.summary}
      </p>

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-white/10">
          <p className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
            {isScheme ? "Benefit" : "Salary"}
          </p>
          <p className="mt-1 font-semibold">
            {isScheme || listing.salary_max === 0
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

      <div className="mt-6 flex flex-col gap-4 border-t border-emerald-900/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-white/10">
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
          <CalendarClock className="h-4 w-4" />
          Apply by{" "}
          {new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(listing.apply_deadline))}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/listings/${listing.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 dark:text-emerald-100"
          >
            View
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <div className="[&_button]:mt-0 [&_button]:px-4 [&_button]:py-2">
            <ApplyNowButton listing={listing} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
