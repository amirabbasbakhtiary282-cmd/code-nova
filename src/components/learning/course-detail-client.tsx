"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseProgress } from "@/features/progress/hooks";
import { markLessonComplete } from "@/features/progress/storage";
import type { Lesson } from "@/types";

interface CourseDetailClientProps {
  courseSlug: string;
  courseTitle: string;
  courseDescription: string;
  lessons: Lesson[];
}

export function CourseDetailClient({ courseSlug, courseTitle, courseDescription, lessons }: CourseDetailClientProps) {
  const [unlockAll, setUnlockAll] = useState(false);
  const [lockedHint, setLockedHint] = useState<string>("");
  const lessonSlugs = lessons.map((lesson) => lesson.slug);
  const progress = useCourseProgress(courseSlug, lessonSlugs);

  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">{courseTitle}</h1>
      <p className="mt-3 text-muted-foreground">{courseDescription}</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface/70 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>پیشرفت دوره</span>
          <span>
            {progress.completedLessons} / {progress.totalLessons}
          </span>
        </div>
        <Progress value={progress.percent} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setUnlockAll((prev) => !prev)}>
          {unlockAll ? "بازگشت به حالت قفل" : "برای دمو باز کن"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            lessons.forEach((lesson) => markLessonComplete(courseSlug, lesson.slug));
          }}
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </Button>
        {lockedHint ? <p className="text-xs text-warning">{lockedHint}</p> : null}
      </div>

      <div className="mt-8 space-y-3">
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedSet.has(lesson.slug);
          const prev = lessons[index - 1];
          const prevCompleted = index === 0 || (prev ? progress.completedSet.has(prev.slug) : true);
          const locked = !prevCompleted && !unlockAll;
          const status = isCompleted ? "کامل" : locked ? "قفل" : "در حال";

          return (
            <Card key={lesson.id} className="border-white/10 bg-surface/75">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    {lesson.order}. {lesson.title}
                  </CardTitle>
                  <CardBody className="mt-1">{lesson.durationMinutes} دقیقه</CardBody>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={isCompleted ? "success" : locked ? "warning" : "info"}>{status}</Badge>
                  {locked ? (
                    <button
                      type="button"
                      onClick={() => setLockedHint("ابتدا درس قبلی را کامل کن")}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-muted-foreground"
                    >
                      🔒 قفل
                    </button>
                  ) : (
                    <Link
                      href={`/learn/${courseSlug}/${lesson.slug}`}
                      className="rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/10"
                    >
                      ورود به درس
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.main>
  );
}
