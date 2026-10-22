"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getCourseProgress,
  getLessonProgress,
  getProgress,
  isExerciseCompleted,
  markExerciseComplete,
  markLessonComplete,
  subscribeProgress,
} from "@/features/progress/storage";

function useProgressStore() {
  return useSyncExternalStore(subscribeProgress, getProgress, getProgress);
}

export function useLessonProgress(courseSlug: string, lessonSlug: string) {
  const store = useProgressStore();
  const key = `${courseSlug}:${lessonSlug}`;
  const item = store.lessons[key] ?? getLessonProgress(courseSlug, lessonSlug);

  return {
    completed: Boolean(item?.completed),
    completedAt: item?.completedAt,
    markComplete: () => markLessonComplete(courseSlug, lessonSlug),
  };
}

export function useCourseProgress(courseSlug: string, lessonSlugs: string[]) {
  const store = useProgressStore();

  return useMemo(() => {
    const computed = getCourseProgress(courseSlug, lessonSlugs);
    const completedSet = new Set(
      lessonSlugs.filter((slug) => {
        const key = `${courseSlug}:${slug}`;
        return store.lessons[key]?.completed;
      }),
    );

    return {
      ...computed,
      completedSet,
    };
  }, [courseSlug, lessonSlugs, store.lessons]);
}

export function useExerciseProgress(exerciseSlug: string) {
  const store = useProgressStore();
  const completed = store.exercises[exerciseSlug]?.completed ?? isExerciseCompleted(exerciseSlug);

  return {
    completed: Boolean(completed),
    markComplete: () => markExerciseComplete(exerciseSlug),
  };
}

export function useUserProgress() {
  return useProgressStore();
}
