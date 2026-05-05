import type { Metadata } from "next";
import { JobsPageClient } from "./page-client";
import { categoryNames, type FilterCategory } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Jobs Search | GovConnect",
  description:
    "Search verified Pakistan government jobs and apply directly on official portals.",
};

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

function getCategoryParam(value?: string): FilterCategory {
  return categoryNames.includes(value as FilterCategory)
    ? (value as FilterCategory)
    : "All";
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <JobsPageClient
      initialCategory={getCategoryParam(params.category)}
      initialSearch={params.search ?? ""}
    />
  );
}
