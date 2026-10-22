"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { lessonExercises } from "@/content/courses/lessons";
import { useExerciseProgress, useUserProgress } from "@/features/progress/hooks";

function ExerciseCard({
  title,
  description,
  level,
  slug,
  courseSlug,
}: {
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  slug: string;
  courseSlug: string;
}) {
  const { completed } = useExerciseProgress(slug);

  return (
    <Card className="border-white/10 bg-surface/75 transition-all hover:-translate-y-1 hover:border-primary/50">
      <div className="flex items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={completed ? "success" : "warning"}>{completed ? "حل شده" : "حل نشده"}</Badge>
          <Badge variant={level === "beginner" ? "info" : "neutral"}>{level === "beginner" ? "مقدماتی" : "متوسط"}</Badge>
        </div>
      </div>
      <CardBody className="mt-2">{description}</CardBody>
      <p className="mt-2 text-xs text-muted-foreground">دوره: {courseSlug}</p>
      <Link href={`/lab?exercise=${slug}`} className="mt-3 inline-block text-sm text-primary">
        حل در آزمایشگاه ←
      </Link>
    </Card>
  );
}

export default function ExercisesPage() {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all");
  const progress = useUserProgress();

  const filtered = useMemo(() => {
    return lessonExercises.filter((item) => {
      if (courseFilter !== "all" && item.courseSlug !== courseFilter) return false;
      if (statusFilter === "all") return true;
      const solved = Boolean(progress.exercises[item.slug]?.completed);
      return statusFilter === "solved" ? solved : !solved;
    });
  }, [courseFilter, statusFilter, progress.exercises]);

  return (
    <>
      <Header />
      <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">تمرین‌ها</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={() => setCourseFilter("all")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">همه دوره‌ها</button>
            <button onClick={() => setCourseFilter("html-basics")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">HTML</button>
            <button onClick={() => setCourseFilter("css-fundamentals")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">CSS</button>
            <button onClick={() => setCourseFilter("js-intro")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">JS</button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 text-xs">
          <button onClick={() => setStatusFilter("all")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">همه</button>
          <button onClick={() => setStatusFilter("solved")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">حل‌شده</button>
          <button onClick={() => setStatusFilter("unsolved")} className="rounded-full border border-border px-3 py-1 text-muted-foreground">حل‌نشده</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.title}
              description={exercise.description}
              level={exercise.level}
              slug={exercise.slug}
              courseSlug={exercise.courseSlug}
            />
          ))}
        </div>
      </motion.main>
    </>
  );
}
