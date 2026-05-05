import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Jobs Search | GovConnect",
  description:
    "Search verified Pakistan government jobs and apply directly on official portals.",
};

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobsPageClient />
    </Suspense>
  );
}
