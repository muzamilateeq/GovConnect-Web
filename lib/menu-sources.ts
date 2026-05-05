import type { FilterCategory } from "@/lib/listings";

export type MenuSource = {
  label: string;
  search: string;
  category: FilterCategory;
  officialUrl: string;
};

export const menuSources: Record<string, MenuSource> = {
  domicile: {
    label: "Domicile",
    search: "Domicile",
    category: "All",
    officialUrl: "https://punjab.gov.pk/domicile",
  },
  "driving-license": {
    label: "Driving License",
    search: "Driving License",
    category: "All",
    officialUrl: "https://dlims.punjab.gov.pk/",
  },
  "land-records": {
    label: "Land Records",
    search: "Land Records",
    category: "All",
    officialUrl: "https://www.punjab-zameen.gov.pk/",
  },
  "tax-portal": {
    label: "Tax Portal",
    search: "Tax Portal",
    category: "All",
    officialUrl: "https://e.fbr.gov.pk/",
  },
  registrations: {
    label: "Registrations",
    search: "Registrations",
    category: "All",
    officialUrl: "https://secp.gov.pk/",
  },
  permits: {
    label: "Permits",
    search: "Permits",
    category: "All",
    officialUrl: "https://pakistan.gov.pk/",
  },
  scholarships: {
    label: "Scholarships",
    search: "Scholarships",
    category: "New Schemes",
    officialUrl: "https://www.hec.gov.pk/english/scholarshipsgrants/Pages/default.aspx",
  },
  "laptop-scheme": {
    label: "Laptop Scheme",
    search: "Laptop Scheme",
    category: "New Schemes",
    officialUrl: "https://www.pmyp.gov.pk/",
  },
  admissions: {
    label: "Admissions",
    search: "Admissions",
    category: "All",
    officialUrl: "https://www.hec.gov.pk/",
  },
  "ppsc-jobs": {
    label: "PPSC Jobs",
    search: "PPSC",
    category: "Latest Jobs",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "police-jobs": {
    label: "Police Jobs",
    search: "Police",
    category: "Latest Jobs",
    officialUrl: "https://punjabpolice.gov.pk/police-jobs",
  },
  "teaching-posts": {
    label: "Teaching Posts",
    search: "Teaching Posts",
    category: "Latest Jobs",
    officialUrl: "https://schools.punjab.gov.pk/",
  },
  eligibility: {
    label: "Eligibility",
    search: "Eligibility",
    category: "Latest Jobs",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  syllabus: {
    label: "Syllabus",
    search: "Syllabus",
    category: "Latest Jobs",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "interview-schedule": {
    label: "Interview Schedule",
    search: "Interview Schedule",
    category: "Latest Jobs",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "written-results": {
    label: "Written Results",
    search: "Written Results",
    category: "Recent Results",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "merit-lists": {
    label: "Merit Lists",
    search: "Merit Lists",
    category: "Recent Results",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "final-selection": {
    label: "Final Selection",
    search: "Final Selection",
    category: "Recent Results",
    officialUrl: "https://www.ppsc.gop.pk/",
  },
  "health-card": {
    label: "Health Card",
    search: "Health Card",
    category: "New Schemes",
    officialUrl: "https://www.pmhealthprogram.gov.pk/",
  },
  subsidies: {
    label: "Subsidies",
    search: "Subsidies",
    category: "New Schemes",
    officialUrl: "https://www.bisp.gov.pk/",
  },
  "youth-finance": {
    label: "Youth Finance",
    search: "Youth Finance",
    category: "New Schemes",
    officialUrl: "https://www.pmyp.gov.pk/",
  },
  "laptop-scheme-2026": {
    label: "Laptop Scheme 2026",
    search: "Laptop Scheme 2026",
    category: "New Schemes",
    officialUrl: "https://www.pmyp.gov.pk/",
  },
  "e-services": {
    label: "E-Services",
    search: "E-Services",
    category: "All",
    officialUrl: "https://pakistan.gov.pk/",
  },
  training: {
    label: "Training",
    search: "Training",
    category: "New Schemes",
    officialUrl: "https://www.navttc.gov.pk/",
  },
  "kissan-card": {
    label: "Kissan Card",
    search: "Kissan Card",
    category: "New Schemes",
    officialUrl: "https://agripunjab.gov.pk/kissan-card",
  },
  "solar-program": {
    label: "Solar Program",
    search: "Solar Program",
    category: "New Schemes",
    officialUrl: "https://energy.punjab.gov.pk/",
  },
  "market-rates": {
    label: "Market Rates",
    search: "Market Rates",
    category: "All",
    officialUrl: "https://www.amis.pk/",
  },
};

export function slugifyMenuLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMenuSource(label: string) {
  return menuSources[slugifyMenuLabel(label)];
}

export function menuSourceHref(label: string) {
  const source = getMenuSource(label);
  const search = source?.search ?? label;
  const category = source?.category ?? "All";
  const officialUrl = source?.officialUrl ?? "https://pakistan.gov.pk/";

  return `/jobs?search=${encodeURIComponent(search)}&category=${encodeURIComponent(
    category,
  )}&official=${encodeURIComponent(officialUrl)}&label=${encodeURIComponent(
    source?.label ?? label,
  )}`;
}
