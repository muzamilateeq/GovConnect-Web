import type { NextRequest } from "next/server";
import { protectDashboard } from "@/lib/supabase-proxy";

export async function proxy(request: NextRequest) {
  return protectDashboard(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
