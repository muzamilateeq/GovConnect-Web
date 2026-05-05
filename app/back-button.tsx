"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="fixed bottom-3 left-3 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/85 px-3 py-2.5 text-sm font-semibold text-emerald-800 shadow-xl shadow-emerald-950/10 backdrop-blur-xl transition hover:bg-emerald-50 sm:bottom-5 sm:left-5 sm:px-4 sm:py-3 dark:border-white/10 dark:bg-[#061b12]/85 dark:text-emerald-100 dark:hover:bg-white/10"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
