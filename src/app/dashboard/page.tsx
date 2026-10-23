"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { lessonExercises, lessonsByCourse } from "@/content/courses";
import { useUserProgress } from "@/features/progress/hooks";
import { localDayISO } from "@/features/progress/storage";

/**
 * Consecutive-day streak in LOCAL time.
 * If the user hasn't studied "today" yet, the streak is still counted from
 * yesterday (grace period) so it doesn't reset in the morning.
 */
function calcStreak(days: string[]) {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const cursor = new Date();

  if (!set.has(localDayISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (set.has(localDayISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function DashboardPage() {
  const progress = useUserProgress();
  const allLessons = Object.entries(lessonsByCourse).flatMap(([courseSlug, lessons]) =>
    lessons
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({ ...lesson, courseSlug })),
  );

  const completedLessons = allLessons.filter((lesson) => progress.lessons[`${lesson.courseSlug}:${lesson.slug}`]?.completed).length;
  const totalLessons = allLessons.length;
  const streakDays = calcStreak(progress.learningDays);
  const completionPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const nextByCourse = Object.entries(lessonsByCourse)
    .map(([courseSlug, lessons]) => {
      const pending = lessons
        .slice()
        .sort((a, b) => a.order - b.order)
        .find((lesson) => !progress.lessons[`${courseSlug}:${lesson.slug}`]?.completed);
      return pending ? { ...pending, courseSlug } : null;
    })
    .filter(Boolean) as Array<{ courseSlug: string; slug: string; title: string }>;

  const hasAnyProgress = completedLessons > 0 || Object.keys(progress.exercises).length > 0;

  const suggestedExercises = lessonExercises.filter((exercise) => !progress.exercises[exercise.slug]?.completed).slice(0, 4);
  const unresolvedExercises = lessonExercises.filter((exercise) => !progress.exercises[exercise.slug]?.completed);

  return (
    <>
      <Header />
      <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold">داشبورد</h1>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-surface/75">
            <p className="text-xs text-muted-foreground">درس‌های کامل‌شده</p>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              <AnimatedCounter value={completedLessons} />
            </p>
          </Card>
          <Card className="border-white/10 bg-surface/75">
            <p className="text-xs text-muted-foreground">درصد پیشرفت</p>
            <p className="mt-2 text-2xl font-extrabold text-secondary-accent">
              <AnimatedCounter value={completionPercent} suffix="%" />
            </p>
          </Card>
          <Card className="border-white/10 bg-surface/75">
            <p className="text-xs text-muted-foreground">روزهای پیوسته</p>
            <p className="mt-2 text-2xl font-extrabold">
              <AnimatedCounter value={streakDays} />
            </p>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-surface/75">
            <CardTitle>ادامه یادگیری</CardTitle>
            <CardBody className="mt-2">از هر دوره یک درس ناتمام انتخاب شده است.</CardBody>
            <Progress value={completionPercent} className="mt-4" />
            <div className="mt-4 space-y-2">
              {nextByCourse.length > 0 ? (
                nextByCourse.map((item) => (
                  <Link key={`${item.courseSlug}-${item.slug}`} href={`/learn/${item.courseSlug}/${item.slug}`} className="block text-sm text-primary">
                    {item.courseSlug} ← {item.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">همه درس‌ها کامل شده‌اند 🎉</p>
              )}

              {!hasAnyProgress ? (
                <Link href="/courses" className="inline-block rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary">
                  شروع دوره جدید
                </Link>
              ) : null}
            </div>
          </Card>

          <Card className="border-white/10 bg-surface/75">
            <CardTitle>وضعیت پیشرفت</CardTitle>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Badge variant="success">{completedLessons} درس کامل</Badge>
              <Badge variant="info">{streakDays} روز پیوسته</Badge>
            </div>
            <Progress value={completionPercent} className="mt-4" />
          </Card>

          <Card className="border-white/10 bg-surface/75">
            <CardTitle>تمرین‌های پیشنهادی</CardTitle>
            <CardBody className="mt-2">بر اساس درس‌های ناتمام تو پیشنهاد شده‌اند.</CardBody>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedExercises.map((exercise) => (
                <Link key={exercise.slug} href={`/lab?exercise=${exercise.slug}`} className="rounded-lg border border-primary/25 px-3 py-2 text-xs text-primary hover:bg-primary/10">
                  {exercise.title}
                </Link>
              ))}
            </div>
          </Card>

          <Card className="border-white/10 bg-surface/75">
            <CardTitle>مرور اشتباهات</CardTitle>
            <CardBody className="mt-2">فعلاً بر اساس تمرین‌های حل‌نشده نمایش داده می‌شود.</CardBody>
            <p className="mt-3 text-sm text-warning">{unresolvedExercises.length} تمرین حل‌نشده داری.</p>
            <Link href="/exercises" className="mt-3 inline-block text-sm text-primary">
              رفتن به تمرین‌ها ←
            </Link>
          </Card>
        </div>
      </motion.main>
    </>
  );
}
