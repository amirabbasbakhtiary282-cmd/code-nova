"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { syncExerciseComplete, syncLessonComplete } from "@/features/progress/actions";
import {
  getCourseProgress,
  getEmptyProgress,
  getProgress,
  markExerciseComplete,
  markLessonComplete,
  subscribeProgress,
} from "@/features/progress/storage";
import type { UserProgress } from "@/features/progress/types";

function useProgressStore(): { progress: UserProgress; userId: string | null } {
  const { data: session, status } = useSession();
  const userId = status === "authenticated" && session?.user?.id ? String(session.user.id) : null;

  const subscribe = useCallback((callback: () => void) => subscribeProgress(callback, userId), [userId]);
  const getSnapshot = useCallback(() => getProgress(userId), [userId]);
  const getServerSnapshot = useCallback(() => getEmptyProgress(), []);
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { progress, userId };
}

/**
 * Local-first completion with server sync for logged-in users.
 * Guests use the anonymous local store; authenticated progress is kept in a
 * per-user store and mirrored to the server. Failures never revert local data.
 */
function completeLesson(courseSlug: string, lessonSlug: string, userId: string | null) {
  markLessonComplete(courseSlug, lessonSlug, userId);
  void syncLessonComplete(courseSlug, lessonSlug).catch((error) => {
    console.warn("[progress] server sync unavailable (kept locally):", error);
  });
}

function completeExercise(exerciseSlug: string, userId: string | null, code: string) {
  markExerciseComplete(exerciseSlug, userId);
  void syncExerciseComplete(exerciseSlug, code).catch((error) => {
    console.warn("[progress] server sync unavailable (kept locally):", error);
  });
}

export function useLessonProgress(courseSlug: string, lessonSlug: string) {
  const { progress, userId } = useProgressStore();
  const key = `${courseSlug}:${lessonSlug}`;
  const item = progress.lessons[key];

  return {
    completed: Boolean(item?.completed),
    completedAt: item?.completedAt,
    markComplete: () => completeLesson(courseSlug, lessonSlug, userId),
  };
}

export function useCourseProgress(courseSlug: string, lessonSlugs: string[]) {
  const { progress, userId } = useProgressStore();
  const lessons = progress.lessons;

  return useMemo(() => {
    const computed = getCourseProgress(courseSlug, lessonSlugs, userId);
    const completedSet = new Set(
      lessonSlugs.filter((slug) => {
        const key = `${courseSlug}:${slug}`;
        return lessons[key]?.completed;
      }),
    );

    return {
      ...computed,
      completedSet,
      markComplete: (lessonSlug: string) => completeLesson(courseSlug, lessonSlug, userId),
    };
  }, [courseSlug, lessonSlugs, lessons, userId]);
}

export function useExerciseProgress(exerciseSlug: string) {
  const { progress, userId } = useProgressStore();
  const item = exerciseSlug ? progress.exercises[exerciseSlug] : undefined;

  return {
    completed: Boolean(item?.completed),
    markComplete: (code: string) => {
      if (exerciseSlug) completeExercise(exerciseSlug, userId, code);
    },
  };
}

export function useUserProgress() {
  return useProgressStore().progress;
}
