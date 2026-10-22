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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

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

export function getProgress(): UserProgress {
  if (!isBrowser()) return defaultProgress;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProgress;

  try {
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return defaultProgress;
  }
}

function saveProgress(next: UserProgress) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitProgressChange();
}

export function subscribeProgress(callback: () => void) {
  if (!isBrowser()) return () => {};

  const handler = () => callback();
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
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
  const day = todayISO();
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
  const day = todayISO();
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
