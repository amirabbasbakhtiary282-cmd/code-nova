import type { CourseProgress, LessonProgress, UserProgress } from "@/features/progress/types";

/**
 * The original key remains the anonymous/guest store so existing browser
 * progress can be migrated after login. Authenticated progress is isolated by
 * user id, preventing one account's local data from being merged into another.
 */
const STORAGE_KEY = "codenova:progress:v1";
const PROGRESS_EVENT = "codenova:progress-updated";

const defaultProgress: UserProgress = {
  lessons: {},
  exercises: {},
  learningDays: [],
};

interface SnapshotCacheEntry {
  raw: string | null;
  snapshot: UserProgress;
}

const snapshotCache = new Map<string, SnapshotCacheEntry>();

function isBrowser() {
  return typeof window !== "undefined";
}

function storageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:user:${encodeURIComponent(userId)}` : STORAGE_KEY;
}

// Local-day helper lives in @/lib/dates (shared with the server data layer);
// re-exported here so existing client imports keep working.
import { localDayISO } from "@/lib/dates";
export { localDayISO };

export function getEmptyProgress(): UserProgress {
  return defaultProgress;
}

function earliestTimestamp(first?: string, second?: string): string | undefined {
  const firstMs = first ? Date.parse(first) : Number.NaN;
  const secondMs = second ? Date.parse(second) : Number.NaN;
  if (Number.isFinite(firstMs) && Number.isFinite(secondMs)) return firstMs <= secondMs ? first : second;
  if (Number.isFinite(firstMs)) return first;
  if (Number.isFinite(secondMs)) return second;
  return first ?? second;
}

function emitProgressChange(key: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: key }));
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
 * React compares snapshot references; returning a fresh object for each read
 * causes an infinite re-render loop. Cache separately per guest/user store and
 * only re-parse when its raw localStorage value changes.
 */
export function getProgress(userId?: string | null): UserProgress {
  if (!isBrowser()) return defaultProgress;

  const key = storageKey(userId);
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch (error) {
    console.warn("[progress] localStorage is not readable:", error);
    return snapshotCache.get(key)?.snapshot ?? defaultProgress;
  }

  const cached = snapshotCache.get(key);
  if (raw === null) {
    if (cached?.raw === null) return cached.snapshot;
    snapshotCache.set(key, { raw: null, snapshot: defaultProgress });
    return defaultProgress;
  }

  if (raw === cached?.raw) return cached.snapshot;

  let parsed: UserProgress;
  try {
    parsed = sanitizeProgress(JSON.parse(raw));
  } catch (error) {
    console.warn("[progress] stored progress is corrupt, resetting:", error);
    parsed = defaultProgress;
  }

  snapshotCache.set(key, { raw, snapshot: parsed });
  return parsed;
}

function saveProgress(next: UserProgress, userId?: string | null): boolean {
  if (!isBrowser()) return false;

  const key = storageKey(userId);
  const raw = JSON.stringify(next);
  let saved = true;
  let cachedRaw: string | null = raw;
  try {
    window.localStorage.setItem(key, raw);
  } catch (error) {
    // Safari private mode / quota errors must not freeze the UI, but we
    // surface them instead of hiding them. Keep the in-memory snapshot usable
    // while localStorage is read-only; otherwise the next getProgress() would
    // immediately replace it with the older persisted value.
    saved = false;
    try {
      cachedRaw = window.localStorage.getItem(key);
    } catch {
      cachedRaw = snapshotCache.get(key)?.raw ?? null;
    }
    console.warn("[progress] could not persist to localStorage:", error);
  }

  snapshotCache.set(key, { raw: cachedRaw, snapshot: next });
  emitProgressChange(key);
  return saved;
}

/** Remove legacy guest data only after a user-scoped copy has been persisted. */
export function clearGuestProgress(): boolean {
  if (!isBrowser()) return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[progress] could not clear migrated guest progress:", error);
    return false;
  }

  snapshotCache.set(STORAGE_KEY, { raw: null, snapshot: defaultProgress });
  emitProgressChange(STORAGE_KEY);
  return true;
}

export function subscribeProgress(callback: () => void, userId?: string | null) {
  if (!isBrowser()) return () => {};

  const key = storageKey(userId);
  const handler = (event: Event) => {
    if ((event as CustomEvent<string>).detail === key) callback();
  };
  const storageHandler = (event: StorageEvent) => {
    if (event.key === key) {
      // Another tab changed this store — drop only its cache entry.
      snapshotCache.delete(key);
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

export function markLessonComplete(courseSlug: string, lessonSlug: string, userId?: string | null) {
  const current = getProgress(userId);
  const key = `${courseSlug}:${lessonSlug}`;
  const now = new Date().toISOString();
  const day = localDayISO();
  const safeDays = Array.isArray(current.learningDays) ? current.learningDays : [];
  const completedAt = earliestTimestamp(current.lessons[key]?.completedAt, now) ?? now;

  const next: UserProgress = {
    ...current,
    lessons: {
      ...current.lessons,
      [key]: { courseSlug, lessonSlug, completed: true, completedAt },
    },
    learningDays: safeDays.includes(day) ? safeDays : [...safeDays, day],
    updatedAt: now,
  };

  saveProgress(next, userId);
}

export function markExerciseComplete(exerciseSlug: string, userId?: string | null) {
  const current = getProgress(userId);
  const now = new Date().toISOString();
  const day = localDayISO();
  const safeDays = Array.isArray(current.learningDays) ? current.learningDays : [];
  const completedAt = earliestTimestamp(current.exercises[exerciseSlug]?.completedAt, now) ?? now;

  const next: UserProgress = {
    ...current,
    exercises: {
      ...current.exercises,
      [exerciseSlug]: { exerciseSlug, completed: true, completedAt },
    },
    learningDays: safeDays.includes(day) ? safeDays : [...safeDays, day],
    updatedAt: now,
  };

  saveProgress(next, userId);
}

/**
 * Merge a remote (server/DB) progress snapshot into a specific local store.
 * Union semantics: a lesson/exercise is completed if either side says so;
 * the earliest completedAt wins.
 */
export function mergeProgress(remote: UserProgress, userId?: string | null): boolean {
  if (!isBrowser()) return false;
  const local = getProgress(userId);

  const lessons: Record<string, LessonProgress> = { ...local.lessons };
  for (const [key, item] of Object.entries(remote.lessons ?? {})) {
    if (!item?.completed) continue;
    const existing = lessons[key];
    const completedAt = earliestTimestamp(existing?.completedAt, item.completedAt);
    lessons[key] = {
      ...existing,
      ...item,
      completed: true,
      ...(completedAt ? { completedAt } : {}),
    };
  }

  const exercises: UserProgress["exercises"] = { ...local.exercises };
  for (const [key, item] of Object.entries(remote.exercises ?? {})) {
    if (!item?.completed) continue;
    const existing = exercises[key];
    const completedAt = earliestTimestamp(existing?.completedAt, item.completedAt);
    exercises[key] = {
      ...existing,
      ...item,
      completed: true,
      ...(completedAt ? { completedAt } : {}),
    };
  }

  const learningDays = Array.from(new Set([...(local.learningDays ?? []), ...(remote.learningDays ?? [])])).sort();

  const next: UserProgress = {
    lessons,
    exercises,
    learningDays,
    updatedAt: new Date().toISOString(),
  };

  return saveProgress(next, userId);
}

export function resetProgress(userId?: string | null) {
  saveProgress(defaultProgress, userId);
}

export function getLessonProgress(courseSlug: string, lessonSlug: string, userId?: string | null): LessonProgress | null {
  const progress = getProgress(userId);
  const key = `${courseSlug}:${lessonSlug}`;
  return progress.lessons[key] ?? null;
}

export function isLessonCompleted(courseSlug: string, lessonSlug: string, userId?: string | null): boolean {
  return Boolean(getLessonProgress(courseSlug, lessonSlug, userId)?.completed);
}

export function getCourseProgress(courseSlug: string, lessonSlugs: string[], userId?: string | null): CourseProgress {
  const progress = getProgress(userId);
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

export function isExerciseCompleted(exerciseSlug: string, userId?: string | null): boolean {
  return Boolean(getProgress(userId).exercises[exerciseSlug]?.completed);
}
