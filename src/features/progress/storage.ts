import type { CourseProgress, LessonProgress, UserProgress } from "@/features/progress/types";

const STORAGE_KEY = "codenova:progress:v1";
const PROGRESS_EVENT = "codenova:progress-updated";

const defaultProgress: UserProgress = {
  lessons: {},
  exercises: {},
  learningDays: [],
};

function isBrowser() {
  return typeof window !== "undefined";
}

// Local-day helper lives in @/lib/dates (shared with the server data layer);
// re-exported here so existing client imports keep working.
import { localDayISO } from "@/lib/dates";
export { localDayISO };

function emitProgressChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

function sanitizeProgress(raw: unknown): UserProgress {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const lessons = obj.lessons && typeof obj.lessons === "object" ? (obj.lessons as Record<string, LessonProgress>) : {};
  const exercises =
    obj.exercises && typeof obj.exercises === "object" ? (obj.exercises as UserProgress["exercises"]) : {};

  const learningDays = Array.isArray(obj.learningDays)
    ? obj.learningDays.filter((item): item is string => typeof item === "string")
    : [];

  const updatedAt = typeof obj.updatedAt === "string" ? obj.updatedAt : undefined;

  return {
    lessons,
    exercises,
    learningDays,
    updatedAt,
  };
}

/**
 * Snapshot cache — REQUIRED by `useSyncExternalStore`.
 * React calls getSnapshot repeatedly and compares references; returning a
 * fresh object each time (e.g. from JSON.parse) causes an infinite
 * re-render loop ("The result of getSnapshot should be cached").
 * We only re-parse when the raw stored string actually changed.
 */
let cachedRaw: string | null = null;
let cachedSnapshot: UserProgress = defaultProgress;

export function getProgress(): UserProgress {
  if (!isBrowser()) return defaultProgress;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[progress] localStorage is not readable:", error);
    return defaultProgress;
  }

  if (raw === null) {
    cachedRaw = null;
    cachedSnapshot = defaultProgress;
    return defaultProgress;
  }

  if (raw === cachedRaw) return cachedSnapshot;

  let parsed: UserProgress;
  try {
    parsed = sanitizeProgress(JSON.parse(raw));
  } catch (error) {
    console.warn("[progress] stored progress is corrupt, resetting:", error);
    parsed = defaultProgress;
  }

  cachedRaw = raw;
  cachedSnapshot = parsed;
  return parsed;
}

function saveProgress(next: UserProgress) {
  if (!isBrowser()) return;
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (error) {
    // Safari private mode / quota errors must not freeze the UI, but we
    // surface them instead of hiding them.
    console.warn("[progress] could not persist to localStorage:", error);
  }
  cachedRaw = raw;
  cachedSnapshot = next;
  emitProgressChange();
}

export function subscribeProgress(callback: () => void) {
  if (!isBrowser()) return () => {};

  const handler = () => callback();
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      // Another tab changed the store — drop the cache so getProgress re-parses.
      cachedRaw = null;
      callback();
    }
  };

  window.addEventListener(PROGRESS_EVENT, handler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(PROGRESS_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export function markLessonComplete(courseSlug: string, lessonSlug: string) {
  const current = getProgress();
  const key = `${courseSlug}:${lessonSlug}`;
  const now = new Date().toISOString();
  const day = localDayISO();
  const safeDays = Array.isArray(current.learningDays) ? current.learningDays : [];

  const next: UserProgress = {
    ...current,
    lessons: {
      ...current.lessons,
      [key]: { courseSlug, lessonSlug, completed: true, completedAt: now },
    },
    learningDays: safeDays.includes(day) ? safeDays : [...safeDays, day],
    updatedAt: now,
  };

  saveProgress(next);
}

export function markExerciseComplete(exerciseSlug: string) {
  const current = getProgress();
  const now = new Date().toISOString();
  const day = localDayISO();
  const safeDays = Array.isArray(current.learningDays) ? current.learningDays : [];

  const next: UserProgress = {
    ...current,
    exercises: {
      ...current.exercises,
      [exerciseSlug]: { exerciseSlug, completed: true, completedAt: now },
    },
    learningDays: safeDays.includes(day) ? safeDays : [...safeDays, day],
    updatedAt: now,
  };

  saveProgress(next);
}

/**
 * Merge a remote (server/DB) progress snapshot into the local store.
 * Union semantics: a lesson/exercise is completed if either side says so;
 * the earliest completedAt wins. Used when a logged-in user's DB progress
 * is hydrated into the client store.
 */
export function mergeProgress(remote: UserProgress) {
  if (!isBrowser()) return;
  const local = getProgress();

  const lessons: Record<string, LessonProgress> = { ...local.lessons };
  for (const [key, item] of Object.entries(remote.lessons ?? {})) {
    const existing = lessons[key];
    if (!existing?.completed) {
      lessons[key] = { ...item, completed: true };
    } else if (item.completedAt && existing.completedAt && item.completedAt < existing.completedAt) {
      lessons[key] = { ...existing, completedAt: item.completedAt };
    }
  }

  const exercises: UserProgress["exercises"] = { ...local.exercises };
  for (const [key, item] of Object.entries(remote.exercises ?? {})) {
    const existing = exercises[key];
    if (!existing?.completed) {
      exercises[key] = { ...item, completed: true };
    } else if (item.completedAt && existing.completedAt && item.completedAt < existing.completedAt) {
      exercises[key] = { ...existing, completedAt: item.completedAt };
    }
  }

  const learningDays = Array.from(new Set([...(local.learningDays ?? []), ...(remote.learningDays ?? [])])).sort();

  const next: UserProgress = {
    lessons,
    exercises,
    learningDays,
    updatedAt: new Date().toISOString(),
  };

  saveProgress(next);
}

export function resetProgress() {
  saveProgress(defaultProgress);
}

export function getLessonProgress(courseSlug: string, lessonSlug: string): LessonProgress | null {
  const progress = getProgress();
  const key = `${courseSlug}:${lessonSlug}`;
  return progress.lessons[key] ?? null;
}

export function isLessonCompleted(courseSlug: string, lessonSlug: string): boolean {
  return Boolean(getLessonProgress(courseSlug, lessonSlug)?.completed);
}

export function getCourseProgress(courseSlug: string, lessonSlugs: string[]): CourseProgress {
  const progress = getProgress();
  const completedLessons = lessonSlugs.filter((lessonSlug) => {
    const key = `${courseSlug}:${lessonSlug}`;
    return progress.lessons[key]?.completed;
  }).length;

  const totalLessons = lessonSlugs.length;
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return {
    courseSlug,
    completedLessons,
    totalLessons,
    percent,
  };
}

export function isExerciseCompleted(exerciseSlug: string): boolean {
  return Boolean(getProgress().exercises[exerciseSlug]?.completed);
}
