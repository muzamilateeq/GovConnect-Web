"use client";

import { ExternalLink } from "lucide-react";
import type { Listing } from "@/lib/listings";

function getApplyUrl(listing: Listing) {
  return (
    listing.apply_url ||
    listing.official_url ||
    listing.official_link ||
    listing.source_url ||
    "#"
  );
}

async function trackApplyClick(listingId: string) {
  try {
    await fetch("/api/listings/apply-click", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ listingId }),
    });
  } catch {
    // Tracking is best-effort; applying should always continue.
  }
}

export function ApplyNowButton({ listing }: { listing: Listing }) {
  const applyUrl = getApplyUrl(listing);
  const canApply = applyUrl !== "#";

  function handleApply() {
    if (!canApply) return;

    trackApplyClick(listing.id);
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleApply}
      disabled={!canApply}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Apply now
      <ExternalLink className="h-4 w-4" />
    </button>
  );
}
