import { NextResponse } from "next/server";
import { createServiceRoleClient, requireAdminUser } from "@/lib/server-supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminUser();
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("scraper_logs")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ logs: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load scraper logs";
    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
