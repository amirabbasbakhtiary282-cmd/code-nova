import type { Course } from "@/types";

export const courses: Course[] = [
  {
    id: "c1",
    slug: "html-basics",
    title: "HTML از صفر",
    description: "ساختار صفحات وب را با HTML یاد بگیر.",
    language: "html",
    level: "beginner",
    lessonCount: 8,
    durationMinutes: 130,
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
