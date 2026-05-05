import { NextResponse, type NextRequest } from "next/server";
import { runScraperProcess } from "@/lib/run-scraper";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { result, stderr } = await runScraperProcess();

    return NextResponse.json({
      ...result,
      stderr: stderr || null,
      triggeredBy: "cron",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Scraper failed",
      },
      { status: 500 },
    );
  }
}
