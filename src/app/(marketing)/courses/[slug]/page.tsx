import { notFound } from "next/navigation";
import { CourseDetailClient } from "@/components/learning/course-detail-client";
import { courses } from "@/content/courses/courses";
import { lessonsByCourse } from "@/content/courses/lessons";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    notFound();
  }

  const lessons = lessonsByCourse[slug] ?? [];

  return (
    <CourseDetailClient
      courseSlug={slug}
      courseTitle={course.title}
      courseDescription={course.description}
      lessons={lessons}
    />
  );
}
