import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LessonViewClient } from "@/components/learning/lesson-view-client";
import { lessonsByCourse } from "@/content/courses/lessons";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const lessons = lessonsByCourse[courseSlug] ?? [];
  const lesson = lessons.find((item) => item.slug === lessonSlug);

  if (!lesson) {
    notFound();
  }

  const currentIndex = lessons.findIndex((item) => item.slug === lessonSlug);
  const nextLesson = lessons[currentIndex + 1];

  return (
    <>
      <Header />
      <LessonViewClient courseSlug={courseSlug} lesson={lesson} allLessons={lessons} nextLessonSlug={nextLesson?.slug} />
    </>
  );
}
