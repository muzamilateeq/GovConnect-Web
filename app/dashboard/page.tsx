import type { Metadata } from "next";
import { AdminCommandCenter } from "./admin-command-center";

export const metadata: Metadata = {
  title: "Admin Command Center | GovConnect",
  description: "Protected publishing, analytics, and bulk moderation console.",
};

export default function DashboardPage() {
  return <AdminCommandCenter />;
}
