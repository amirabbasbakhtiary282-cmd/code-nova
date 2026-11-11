import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

// Fonts are self-hosted from /public/fonts (copied from @fontsource packages
// by scripts/copy-fonts.mjs and declared with @font-face in globals.css).
// This keeps builds working in offline/restricted networks where
// fonts.googleapis.com is unreachable.

export const metadata: Metadata = {
  title: {
    default: "کدنوا | یادگیری برنامه‌نویسی به فارسی",
    template: "%s | کدنوا",
  },
  description: "پلتفرم تعاملی یادگیری برنامه‌نویسی برای فارسی‌زبانان",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/vazirmatn-arabic-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/vazirmatn-latin-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-foreground antialiased [font-family:var(--font-sans)]">
        <Providers>
          <ScrollProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}
