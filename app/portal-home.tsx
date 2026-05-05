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
  Menu,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { menuSourceHref } from "@/lib/menu-sources";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  {
    label: "Services",
    href: menuSourceHref("E-Services"),
    columns: [
      ["Citizen Services", "Domicile", "Driving License", "Land Records"],
      ["Business", "Tax Portal", "Registrations", "Permits"],
      ["Education", "Scholarships", "Laptop Scheme", "Admissions"],
    ],
  },
  {
    label: "Jobs",
    href: menuSourceHref("PPSC Jobs"),
    columns: [
      ["Recruitment", "PPSC Jobs", "Police Jobs", "Teaching Posts"],
      ["Support", "Eligibility", "Syllabus", "Interview Schedule"],
      ["Results", "Written Results", "Merit Lists", "Final Selection"],
    ],
  },
  {
    label: "Schemes",
    href: menuSourceHref("Laptop Scheme 2026"),
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
  const router = useRouter();
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  const suggestions = useMemo(() => {
    if (!search.trim()) return popularSearches.slice(0, 3);

    return popularSearches.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  function openResults(nextSearch = search) {
    const query = nextSearch.trim();
    const path = query
      ? `/jobs?search=${encodeURIComponent(query)}`
      : "/jobs";

    router.push(path);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbf8] text-emerald-950 transition-colors duration-300 dark:bg-[#03140d] dark:text-white">
      <Navbar
        megaOpen={megaOpen}
        mobileOpen={mobileOpen}
        scrolled={scrolled}
        setMegaOpen={setMegaOpen}
        setMobileOpen={setMobileOpen}
      />

      <section className="relative isolate px-4 pt-28 pb-14 sm:px-8 sm:pt-32 sm:pb-20 lg:px-12">
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
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-normal text-emerald-950 sm:mt-7 sm:text-6xl lg:text-7xl dark:text-white">
              Government services, jobs, and schemes in one premium portal.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-900/70 sm:mt-6 sm:text-lg sm:leading-8 dark:text-emerald-50/75">
              Discover verified opportunities, track applications, and access
              citizen services through a fast, secure, modern digital front
              desk.
            </p>

            <motion.form
              onSubmit={(event) => {
                event.preventDefault();
                openResults();
              }}
              className="mt-9 max-w-2xl rounded-[2rem] border border-white/80 bg-white/75 p-3 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/30"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="grid gap-3 sm:flex sm:items-center">
                <Search className="ml-3 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-200" />
                <input
                  aria-label="Search portal"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs, schemes, results, certificates..."
                  className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base font-medium outline-none placeholder:text-emerald-900/45 sm:h-14 sm:px-0 dark:placeholder:text-white/45"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 sm:w-auto"
                >
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
                      onClick={() => {
                        setSearch(item);
                        openResults(item);
                      }}
                      type="button"
                      className="rounded-full border border-emerald-700/10 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:border-emerald-700/30 dark:border-white/10 dark:bg-white/10 dark:text-emerald-50"
                    >
                      {item}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-2xl shadow-emerald-950/15 backdrop-blur-2xl sm:p-5 dark:border-white/10 dark:bg-white/10">
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
                <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    ["42K+", "Applications"],
                    ["186", "Active Jobs"],
                    ["24/7", "Tracking"],
                    ["99.9%", "Verified"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-3xl border border-white/10 bg-white/10 p-3 sm:p-4"
                    >
                      <p className="text-2xl font-semibold sm:text-3xl">{value}</p>
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
    </main>
  );
}

function Navbar({
  megaOpen,
  mobileOpen,
  scrolled,
  setMegaOpen,
  setMobileOpen,
}: {
  megaOpen: string | null;
  mobileOpen: boolean;
  scrolled: boolean;
  setMegaOpen: (value: string | null) => void;
  setMobileOpen: (value: boolean) => void;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-4 py-4 transition-all duration-300 sm:px-8 lg:px-12 ${
        scrolled ? "py-3" : ""
      }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <nav className="mx-auto max-w-7xl rounded-[1.5rem] border border-white/70 bg-white/85 px-3 py-3 shadow-xl shadow-emerald-950/8 backdrop-blur-2xl sm:rounded-[1.75rem] sm:px-4 dark:border-white/10 dark:bg-[#061b12]/85 dark:shadow-black/30">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20 sm:h-11 sm:w-11">
              <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-5">
                GovConnect
              </span>
              <span className="hidden text-xs font-medium text-emerald-900/55 sm:block dark:text-white/55">
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
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 sm:inline-flex"
            >
              Citizen Login
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-emerald-800 shadow-sm lg:hidden dark:border-white/10 dark:bg-white/10 dark:text-emerald-100"
            >
              <Menu className="h-5 w-5" />
            </button>
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
                            href={menuSourceHref(link)}
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
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-emerald-950/35 p-4 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ y: -16, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: -16, scale: 0.98 }}
                className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#061b12]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold">Menu</p>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 dark:bg-white/10 dark:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-5">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900 dark:bg-white/10 dark:text-white"
                      >
                        {item.label}
                      </Link>
                      <div className="mt-3 grid gap-2">
                        {item.columns.flatMap((column) =>
                          column.slice(1).map((link) => (
                            <Link
                              key={`${item.label}-${link}`}
                              href={menuSourceHref(link)}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-2xl px-4 py-2 text-sm font-medium text-emerald-900/70 hover:bg-emerald-50 dark:text-white/70 dark:hover:bg-white/10"
                            >
                              {link}
                            </Link>
                          )),
                        )}
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl bg-emerald-800 px-4 py-3 text-center font-semibold text-white"
                  >
                    Citizen Login
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
