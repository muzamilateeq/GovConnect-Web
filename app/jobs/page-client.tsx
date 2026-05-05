"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListingsEngine } from "@/app/listings-engine";

export function JobsPageClient() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  return (
    <main className="min-h-screen bg-[#f8fbf8] text-emerald-950 dark:bg-[#03140d] dark:text-white">
      <section className="px-5 pt-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            Official Direct Apply
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            Search Pakistan government jobs
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-900/65 dark:text-white/65">
            Search FPSC, PPSC, SPSC, BPSC, KPPSC, forces, and scheme records in
            real time. Apply opens the official government page in a new tab.
          </p>

          <div className="mt-7 flex max-w-2xl items-center gap-3 rounded-[1.5rem] border border-emerald-900/10 bg-emerald-50 px-4 shadow-inner dark:border-white/10 dark:bg-white/10">
            <Search className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-200" />
            <input
              aria-label="Search jobs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search FPSC, PPSC, Laptop Scheme..."
              className="h-14 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-emerald-900/45 dark:placeholder:text-white/45"
            />
          </div>
        </div>
      </section>

      <ListingsEngine search={search} />
    </main>
  );
}
