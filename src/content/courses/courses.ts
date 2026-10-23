import type { Course } from "@/types";

export const courses: Course[] = [
  {
    id: "c1",
    slug: "html-basics",
    title: "HTML از صفر",
    description:
      "دوره کامل HTML برای کسی که هیچ آشنایی با برنامه‌نویسی ندارد: ۱۲ درس از تگ‌ها و ساختار صفحه تا فرم‌ها، رسانه، سئو و دسترس‌پذیری — با مثال کد کامنت‌شده، اشتباهات رایج و دو تمرین در هر درس.",
    language: "html",
    level: "beginner",
    lessonCount: 12,
    durationMinutes: 185,
    published: true,
  },
  {
    id: "c2",
    slug: "css-fundamentals",
    title: "CSS و طراحی",
    description: "استایل‌دهی، چیدمان و واکنش‌گرایی با CSS.",
    language: "css",
    level: "beginner",
    lessonCount: 8,
    durationMinutes: 140,
    published: true,
  },
  {
    id: "c3",
    slug: "js-intro",
    title: "JavaScript مقدماتی",
    description: "متغیرها، توابع و منطق برنامه‌نویسی با JavaScript.",
    language: "javascript",
    level: "intermediate",
    lessonCount: 8,
    durationMinutes: 140,
    published: true,
  },
];
