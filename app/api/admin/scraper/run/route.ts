import { NextResponse } from "next/server";
import { runScraperProcess } from "@/lib/run-scraper";
import { requireAdminUser } from "@/lib/server-supabase";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  try {
    await requireAdminUser();
    const { result, stderr } = await runScraperProcess();

    return NextResponse.json({
      ...result,
      stderr: stderr || null,
      triggeredBy: "admin",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scraper failed";
    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
