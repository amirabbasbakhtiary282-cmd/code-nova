"use client";

import { useMemo, useSyncExternalStore } from "react";
import { syncExerciseComplete, syncLessonComplete } from "@/features/progress/actions";
import {
  getCourseProgress,
  getProgress,
  markExerciseComplete,
  markLessonComplete,
  subscribeProgress,
} from "@/features/progress/storage";

function useProgressStore() {
  // getProgress is reference-stable (cached snapshot), so this is safe with
  // useSyncExternalStore. getServerSnapshot returns a module-level constant.
  return useSyncExternalStore(subscribeProgress, getProgress, getProgress);
}

/**
 * Local-first completion with server sync for logged-in users.
 * The server action is a no-op for guests ({ synced: false }) — localStorage
 * stays their store of record. Failures never block or revert local progress;
 * ProgressSync re-merges on the next authenticated page load.
 */
function completeLesson(courseSlug: string, lessonSlug: string) {
  markLessonComplete(courseSlug, lessonSlug);
  void syncLessonComplete(courseSlug, lessonSlug).catch((error) => {
    console.warn("[progress] server sync unavailable (kept locally):", error);
  });
}

function completeExercise(exerciseSlug: string) {
  markExerciseComplete(exerciseSlug);
  void syncExerciseComplete(exerciseSlug).catch((error) => {
    console.warn("[progress] server sync unavailable (kept locally):", error);
  });
}

export function useLessonProgress(courseSlug: string, lessonSlug: string) {
  const store = useProgressStore();
  const key = `${courseSlug}:${lessonSlug}`;
  const item = store.lessons[key];

  return {
    completed: Boolean(item?.completed),
    completedAt: item?.completedAt,
    markComplete: () => completeLesson(courseSlug, lessonSlug),
  };
}

export function useCourseProgress(courseSlug: string, lessonSlugs: string[]) {
  const store = useProgressStore();
  const lessons = store.lessons;

  return useMemo(() => {
    const computed = getCourseProgress(courseSlug, lessonSlugs);
    const completedSet = new Set(
      lessonSlugs.filter((slug) => {
        const key = `${courseSlug}:${slug}`;
        return lessons[key]?.completed;
      }),
    );

    return {
      ...computed,
      completedSet,
    };
  }, [courseSlug, lessonSlugs, lessons]);
}

export function useExerciseProgress(exerciseSlug: string) {
  const store = useProgressStore();
  const item = exerciseSlug ? store.exercises[exerciseSlug] : undefined;

  return {
    completed: Boolean(item?.completed),
    markComplete: () => {
      if (exerciseSlug) completeExercise(exerciseSlug);
    },
  };
}

export function useUserProgress() {
  return useProgressStore();
}
