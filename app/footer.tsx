import { ArrowUpRight, Landmark } from "lucide-react";
import Link from "next/link";
import { menuSourceHref } from "@/lib/menu-sources";

const footerSections = [
  {
    title: "Jobs",
    links: ["PPSC Jobs", "Police Jobs", "Teaching Posts", "Written Results"],
  },
  {
    title: "Schemes",
    links: ["Laptop Scheme 2026", "Kissan Card", "Health Card", "Solar Program"],
  },
  {
    title: "Services",
    links: ["Driving License", "Domicile", "Tax Portal", "Land Records"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-emerald-900/10 bg-white px-4 py-10 text-emerald-950 sm:px-8 lg:px-12 dark:border-white/10 dark:bg-[#03140d] dark:text-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Landmark className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-semibold">GovConnect</span>
              <span className="text-xs font-medium text-emerald-900/55 dark:text-white/55">
                Public Services Portal
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-900/65 dark:text-white/65">
            Search public jobs, schemes, results, and citizen services. Every
            apply action opens the official government website in a new tab.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-emerald-950 dark:text-white">
                {section.title}
              </h2>
              <div className="mt-3 grid gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link}
                    href={menuSourceHref(link)}
                    className="inline-flex w-fit items-center gap-1 text-sm font-medium text-emerald-900/60 transition hover:text-emerald-800 dark:text-white/60 dark:hover:text-white"
                  >
                    {link}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-emerald-900/10 pt-5 text-xs font-medium text-emerald-900/55 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-white/55">
        <p>© 2026 GovConnect. Unofficial public-service search gateway.</p>
        <p>Verify final details on the official government website.</p>
      </div>
    </footer>
  );
}
