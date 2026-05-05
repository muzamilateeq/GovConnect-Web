export type ListingCategory = "Latest Jobs" | "New Schemes" | "Recent Results";

export type DeadlineFilter = "all" | "today" | "week";

export type Listing = {
  id: string;
  slug: string;
  title: string;
  organization: string;
  organization_logo_url: string | null;
  salary_min: number;
  salary_max: number;
  bps_min: number;
  bps_max: number;
  city: string;
  province: string;
  category: ListingCategory;
  apply_deadline: string;
  summary: string;
  description: string;
  apply_url: string;
  is_published: boolean;
  created_at: string;
};

export type ListingFilters = {
  search: string;
  category: ListingCategory;
  salary: [number, number];
  bps: [number, number];
  provinces: string[];
  deadline: DeadlineFilter;
};

export const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad",
];

export const categoryNames: ListingCategory[] = [
  "Latest Jobs",
  "New Schemes",
  "Recent Results",
];

export const defaultFilters: ListingFilters = {
  search: "",
  category: "Latest Jobs",
  salary: [0, 450000],
  bps: [1, 22],
  provinces: [],
  deadline: "all",
};

export const mockListings: Listing[] = [
  {
    id: "8c5777d4-83d8-44bc-9d04-fc973ce9342d",
    slug: "ppsc-assistant-director-2026",
    title: "Assistant Director Recruitment 2026",
    organization: "Punjab Public Service Commission",
    organization_logo_url: null,
    salary_min: 115000,
    salary_max: 210000,
    bps_min: 17,
    bps_max: 17,
    city: "Lahore",
    province: "Punjab",
    category: "Latest Jobs",
    apply_deadline: "2026-05-28",
    summary: "Verified public service roles with written test scheduling.",
    description:
      "Applications are open for Assistant Director positions across provincial departments. Candidates can review eligibility, syllabus, and document requirements before applying.",
    apply_url: "#",
    is_published: true,
    created_at: "2026-05-05T00:00:00.000Z",
  },
  {
    id: "32f19cb1-219a-4af3-994c-b8d2f7ff0ec7",
    slug: "laptop-scheme-2026-phase-one",
    title: "Laptop Scheme 2026 Phase One",
    organization: "Higher Education Department",
    organization_logo_url: null,
    salary_min: 0,
    salary_max: 0,
    bps_min: 1,
    bps_max: 22,
    city: "Islamabad",
    province: "Islamabad",
    category: "New Schemes",
    apply_deadline: "2026-06-10",
    summary: "Student verification and merit review are now live.",
    description:
      "Eligible students can submit records for digital verification and track phase-wise distribution status through the portal.",
    apply_url: "#",
    is_published: true,
    created_at: "2026-05-05T00:00:00.000Z",
  },
  {
    id: "284b9f6a-11c8-42b7-82d6-4888c982a9ec",
    slug: "educator-merit-list-2026",
    title: "Educator Merit List 2026",
    organization: "School Education Department",
    organization_logo_url: null,
    salary_min: 75000,
    salary_max: 155000,
    bps_min: 14,
    bps_max: 16,
    city: "Multan",
    province: "Punjab",
    category: "Recent Results",
    apply_deadline: "2026-05-07",
    summary: "District merit panels and document scrutiny schedule published.",
    description:
      "Final panels for educator recruitment are available with district-level instructions for selected and waiting candidates.",
    apply_url: "#",
    is_published: true,
    created_at: "2026-05-05T00:00:00.000Z",
  },
  {
    id: "63ee9200-23a9-45b0-ab40-50582c6dd1e2",
    slug: "digital-punjab-fellowship",
    title: "Digital Punjab Fellowship",
    organization: "Punjab Information Technology Board",
    organization_logo_url: null,
    salary_min: 90000,
    salary_max: 140000,
    bps_min: 16,
    bps_max: 17,
    city: "Lahore",
    province: "Punjab",
    category: "Latest Jobs",
    apply_deadline: "2026-06-20",
    summary: "Trainee seats for product, data, and citizen service teams.",
    description:
      "A competitive fellowship for young professionals to work on digital government products, analytics, and field deployment.",
    apply_url: "#",
    is_published: true,
    created_at: "2026-05-05T00:00:00.000Z",
  },
  {
    id: "6d56b750-5d56-4119-8935-c1c359ee3e3b",
    slug: "green-solar-support",
    title: "Green Solar Support Program",
    organization: "Energy Department",
    organization_logo_url: null,
    salary_min: 0,
    salary_max: 0,
    bps_min: 1,
    bps_max: 22,
    city: "Quetta",
    province: "Balochistan",
    category: "New Schemes",
    apply_deadline: "2026-05-12",
    summary: "Household solar subsidy balloting and status tracking.",
    description:
      "Applicants can verify household eligibility, review required documents, and monitor balloting outcomes in real time.",
    apply_url: "#",
    is_published: true,
    created_at: "2026-05-05T00:00:00.000Z",
  },
];
