import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/listing-queries";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#052e1b",
          color: "white",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              padding: "14px 24px",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            GovConnect Portal
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              background: "#d9f99d",
              color: "#14532d",
              padding: "14px 24px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {listing?.category ?? "Verified Listing"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 800,
              maxWidth: 920,
            }}
          >
            {listing?.title ?? "Government Opportunity"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#bbf7d0",
              maxWidth: 960,
            }}
          >
            {listing?.organization ?? "Public Services Department"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#ecfdf5",
          }}
        >
          <div style={{ display: "flex" }}>
            {listing ? `${listing.city}, ${listing.province}` : "Pakistan"}
          </div>
          <div style={{ display: "flex" }}>
            Deadline:{" "}
            {listing
              ? new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(listing.apply_deadline))
              : "Open"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
