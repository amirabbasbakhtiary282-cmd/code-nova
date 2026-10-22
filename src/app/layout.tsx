import type { Metadata } from "next";
import { JetBrains_Mono, Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "کدنوا | یادگیری برنامه‌نویسی به فارسی",
  description: "پلتفرم تعاملی یادگیری برنامه‌نویسی برای فارسی‌زبانان",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground antialiased [font-family:var(--font-sans)]">
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
