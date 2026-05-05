import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/server-supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { listingId } = (await request.json()) as { listingId?: string };

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: listing, error: readError } = await supabase
      .from("listings")
      .select("click_count")
      .eq("id", listingId)
      .maybeSingle<{ click_count: number | null }>();

    if (readError) throw readError;
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({ click_count: (listing.click_count ?? 0) + 1 })
      .eq("id", listingId);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not track apply click",
      },
      { status: 500 },
    );
  }
}
