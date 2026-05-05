import type { Metadata } from "next";
import { BackButton } from "./back-button";
import { Footer } from "./footer";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "GovConnect Portal",
  description:
    "A modern government services portal for public jobs, schemes, and results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-white text-emerald-950">
        <Providers>
          {children}
          <Footer />
          <BackButton />
        </Providers>
      </body>
    </html>
  );
}
