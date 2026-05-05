"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Landmark,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ListingsEngine } from "./listings-engine";

const navItems = [
  {
    label: "Services",
    href: "/#listings",
    columns: [
      ["Citizen Services", "Domicile", "Driving License", "Land Records"],
      ["Business", "Tax Portal", "Registrations", "Permits"],
      ["Education", "Scholarships", "Laptop Scheme", "Admissions"],
    ],
  },
  {
    label: "Jobs",
    href: "/jobs",
    columns: [
      ["Recruitment", "PPSC Jobs", "Police Jobs", "Teaching Posts"],
      ["Support", "Eligibility", "Syllabus", "Interview Schedule"],
      ["Results", "Written Results", "Merit Lists", "Final Selection"],
    ],
  },
  {
    label: "Schemes",
    href: "/#listings",
    columns: [
      ["Welfare", "Health Card", "Subsidies", "Youth Finance"],
      ["Digital", "Laptop Scheme 2026", "E-Services", "Training"],
      ["Agriculture", "Kissan Card", "Solar Program", "Market Rates"],
    ],
  },
];

const popularSearches = [
  "PPSC Jobs",
  "Laptop Scheme 2026",
  "Merit List",
  "Health Card",
  "Police Recruitment",
];

export function PortalHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return popularSearches.slice(0, 3);

    return popularSearches.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbf8] text-emerald-950 transition-colors duration-300 dark:bg-[#03140d] dark:text-white">
      <Navbar
        darkMode={darkMode}
        megaOpen={megaOpen}
        scrolled={scrolled}
        setDarkMode={setDarkMode}
        setMegaOpen={setMegaOpen}
      />

      <section className="relative isolate px-5 pt-32 pb-20 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#f8fbf8_0%,#ffffff_46%,#e8f7ed_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#03140d_0%,#062817_48%,#0b3b24_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-100">
              <Landmark className="h-4 w-4" />
              Unified Public Services Gateway
            </span>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-normal text-emerald-950 sm:text-6xl lg:text-7xl dark:text-white">
              Government services, jobs, and schemes in one premium portal.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-900/70 dark:text-emerald-50/75">
              Discover verified opportunities, track applications, and access
              citizen services through a fast, secure, modern digital front
              desk.
            </p>

            <motion.div
              className="mt-9 max-w-2xl rounded-[2rem] border border-white/80 bg-white/75 p-3 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/30"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <Search className="ml-3 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-200" />
                <input
                  aria-label="Search portal"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs, schemes, results, certificates..."
                  className="h-14 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-emerald-900/45 dark:placeholder:text-white/45"
                />
                <button className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-2 pb-1">
                <AnimatePresence mode="popLayout">
                  {suggestions.map((item) => (
                    <motion.button
                      key={item}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onClick={() => setSearch(item)}
                      className="rounded-full border border-emerald-700/10 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:border-emerald-700/30 dark:border-white/10 dark:bg-white/10 dark:text-emerald-50"
                    >
                      {item}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-emerald-950/15 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
              <div className="rounded-[1.5rem] bg-emerald-950 p-6 text-white shadow-inner dark:bg-[#021008]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100/70">Portal Status</p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      Live Service Desk
                    </h2>
                  </div>
                  <Bell className="h-6 w-6 text-emerald-200" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    ["42K+", "Applications"],
                    ["186", "Active Jobs"],
                    ["24/7", "Tracking"],
                    ["99.9%", "Verified"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-3xl border border-white/10 bg-white/10 p-4"
                    >
                      <p className="text-3xl font-semibold">{value}</p>
                      <p className="mt-1 text-sm text-emerald-100/70">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ListingsEngine search={search} />
    </main>
  );
}

function Navbar({
  darkMode,
  megaOpen,
  scrolled,
  setDarkMode,
  setMegaOpen,
}: {
  darkMode: boolean;
  megaOpen: string | null;
  scrolled: boolean;
  setDarkMode: (value: boolean) => void;
  setMegaOpen: (value: string | null) => void;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-4 py-4 transition-all duration-300 sm:px-8 lg:px-12 ${
        scrolled ? "py-3" : ""
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <nav className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/70 bg-white/75 px-4 py-3 shadow-xl shadow-emerald-950/8 backdrop-blur-2xl dark:border-white/10 dark:bg-[#061b12]/75 dark:shadow-black/30">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Landmark className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-5">
                GovConnect
              </span>
              <span className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
                Public Services Portal
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setMegaOpen(item.label)}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-emerald-900/70 transition hover:bg-emerald-50 hover:text-emerald-950 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-semibold text-emerald-900/70 transition hover:bg-emerald-50 hover:text-emerald-950 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Track Application
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-emerald-800 shadow-sm transition hover:bg-emerald-50 dark:border-white/10 dark:bg-white/10 dark:text-emerald-100"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              href="/dashboard"
              className="hidden rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 sm:inline-flex"
            >
              Citizen Login
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute left-1/2 top-[5.4rem] hidden w-[min(980px,calc(100vw-4rem))] -translate-x-1/2 rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-emerald-950/15 backdrop-blur-2xl lg:block dark:border-white/10 dark:bg-[#061b12]/95"
            >
              <div className="grid grid-cols-3 gap-6">
                {navItems
                  .find((item) => item.label === megaOpen)
                  ?.columns.map((column) => (
                    <div key={column[0]}>
                      <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        {column[0]}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {column.slice(1).map((link) => (
                          <Link
                            key={link}
                            href={
                              megaOpen === "Jobs"
                                ? `/jobs?search=${encodeURIComponent(link)}`
                                : `/#listings`
                            }
                            className="block rounded-2xl px-3 py-2 text-sm font-medium text-emerald-900/65 transition hover:bg-emerald-50 hover:text-emerald-950 dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            {link}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
