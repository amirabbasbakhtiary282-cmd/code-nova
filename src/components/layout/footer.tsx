"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { slideUp } from "@/lib/motion";

export function Footer() {
  return (
    <motion.footer
      variants={slideUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-20 border-t border-white/10 bg-[#050510]/80 backdrop-blur-2xl"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-foreground">کدنوا</p>
          <p className="mt-2 text-sm text-muted-foreground">یادگیری برنامه‌نویسی به فارسی، از مفهوم تا تمرین واقعی.</p>
        </div>

        <div>
          <p className="mb-3 font-bold">دوره‌ها</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/courses/html-basics" className="transition-colors hover:text-[#8B5CF6]">HTML از صفر</Link></li>
            <li><Link href="/courses/css-fundamentals" className="transition-colors hover:text-[#3B82F6]">CSS و طراحی</Link></li>
            <li><Link href="/courses/js-intro" className="transition-colors hover:text-[#EC4899]">JavaScript مقدماتی</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-bold">لینک‌ها</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/lab" className="transition-colors hover:text-[#8B5CF6]">آزمایشگاه</Link></li>
            <li><Link href="/exercises" className="transition-colors hover:text-[#3B82F6]">تمرین‌ها</Link></li>
            <li><Link href="/dashboard" className="transition-colors hover:text-[#EC4899]">داشبورد</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-bold">ارتباط</p>
          <p className="text-sm text-muted-foreground">hello@codenova.ir</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} کدنوا — همه حقوق محفوظ است.
      </div>
    </motion.footer>
  );
}
