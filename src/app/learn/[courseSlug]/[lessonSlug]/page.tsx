import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LessonViewClient } from "@/components/learning/lesson-view-client";
import { courses } from "@/content/courses/courses";
import { lessonsByCourse } from "@/content/courses";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}

// Each lesson gets its own unique title/description — the site practices the
// SEO rules it teaches in the meta-tags lesson (unique title, «topic | site»).
export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const lesson = (lessonsByCourse[courseSlug] ?? []).find((item) => item.slug === lessonSlug);
  const course = courses.find((item) => item.slug === courseSlug);
  if (!lesson) return {};
  const summary = lesson.summary ?? lesson.whyItMatters ?? course?.description ?? "";
  return {
    // The root layout's title template appends «| کدنوا» — pass the bare title.
    title: lesson.title,
    description: summary.slice(0, 155),
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const lessons = lessonsByCourse[courseSlug] ?? [];
  const lesson = lessons.find((item) => item.slug === lessonSlug);

  if (!lesson) {
    notFound();
  }

  const course = courses.find((item) => item.slug === courseSlug);
  const currentIndex = lessons.findIndex((item) => item.slug === lessonSlug);
  const nextLesson = lessons[currentIndex + 1];

  return (
    <>
      <Header />
      <LessonViewClient
        courseSlug={courseSlug}
        courseTitle={course?.title ?? courseSlug}
        lesson={lesson}
        allLessons={lessons}
        nextLessonSlug={nextLesson?.slug}
      />
    </>
  );
}
