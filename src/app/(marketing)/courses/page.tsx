import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { PageEnter } from "@/components/ui/page-enter";
import { Reveal } from "@/components/ui/reveal";
import { courses } from "@/content/courses/courses";

export default function CoursesPage() {
  return (
    <PageEnter>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">دوره‌ها</h1>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">همه</span>
            <span className="rounded-full border border-border px-3 py-1">HTML</span>
            <span className="rounded-full border border-border px-3 py-1">CSS</span>
            <span className="rounded-full border border-border px-3 py-1">JavaScript</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <Reveal key={course.id} delay={index * 0.04}>
              <Link href={`/courses/${course.slug}`}>
                <Card className="h-full border-white/10 bg-surface/75 transition-all hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_25px_45px_-25px_rgba(16,185,129,0.75)]">
                  <div className="flex items-center justify-between">
                    <CardTitle>{course.title}</CardTitle>
                    <Badge variant={course.level === "beginner" ? "success" : "info"}>
                      {course.level === "beginner" ? "مقدماتی" : "متوسط"}
                    </Badge>
                  </div>
                  <CardBody className="mt-3">{course.description}</CardBody>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {course.lessonCount} درس · {course.durationMinutes} دقیقه
                  </p>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
    </PageEnter>
  );
}
