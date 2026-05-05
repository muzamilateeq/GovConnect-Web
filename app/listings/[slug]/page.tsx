import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { getListingBySlug } from "@/lib/listing-queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Listing not found | GovConnect",
    };
  }

  const title = `${listing.title} | ${listing.organization}`;
  const description = listing.summary;
  const image = `/listings/${listing.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: `/listings/${listing.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/listings/${listing.slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8fbf8] px-5 py-10 text-emerald-950 dark:bg-[#03140d] dark:text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#listings"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/75 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-100">
                {listing.category}
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                {listing.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-900/70 dark:text-white/70">
                {listing.summary}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Building2 className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoPill
              icon={<Building2 className="h-5 w-5" />}
              label="Organization"
              value={listing.organization}
            />
            <InfoPill
              icon={<MapPin className="h-5 w-5" />}
              label="Location"
              value={`${listing.city}, ${listing.province}`}
            />
            <InfoPill
              icon={<CalendarClock className="h-5 w-5" />}
              label="Apply deadline"
              value={new Intl.DateTimeFormat("en", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date(listing.apply_deadline))}
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-emerald-50 p-5 dark:bg-white/10">
              <p className="text-sm font-semibold text-emerald-900/55 dark:text-white/55">
                Salary range
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {listing.salary_max === 0
                  ? "Eligibility based"
                  : `PKR ${listing.salary_min.toLocaleString()} - ${listing.salary_max.toLocaleString()}`}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-emerald-50 p-5 dark:bg-white/10">
              <p className="text-sm font-semibold text-emerald-900/55 dark:text-white/55">
                BPS scale
              </p>
              <p className="mt-2 text-2xl font-semibold">
                BPS {listing.bps_min}-{listing.bps_max}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-emerald-900/10 pt-8 dark:border-white/10">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p className="mt-4 text-base leading-8 text-emerald-900/70 dark:text-white/70">
              {listing.description}
            </p>
            <a
              href={listing.apply_url}
              className="mt-8 inline-flex rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900"
            >
              Apply now
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-emerald-900/10 bg-white/70 p-4 shadow-lg shadow-emerald-950/5 dark:border-white/10 dark:bg-white/10">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>
      <p className="mt-3 font-semibold">{value}</p>
    </div>
  );
}
