// Defensive server-side validation of client-submitted progress snapshots.
// Never trust the shape coming from localStorage/clients.
import type { ProgressSnapshotDTO } from "@/server/repositories";

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9-]+$/i;

export function sanitizeSnapshotInput(raw: unknown): ProgressSnapshotDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const lessons: ProgressSnapshotDTO["lessons"] = {};
  if (obj.lessons && typeof obj.lessons === "object") {
    for (const [key, value] of Object.entries(obj.lessons as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      const courseSlug = typeof item.courseSlug === "string" ? item.courseSlug : "";
      const lessonSlug = typeof item.lessonSlug === "string" ? item.lessonSlug : "";
      const completedAt = typeof item.completedAt === "string" && ISO_RE.test(item.completedAt) ? item.completedAt : new Date().toISOString();
      if (!SLUG_RE.test(courseSlug) || !SLUG_RE.test(lessonSlug)) continue;
      if (item.completed !== true) continue;
      if (key !== `${courseSlug}:${lessonSlug}`) continue;
      lessons[key] = { courseSlug, lessonSlug, completed: true, completedAt };
    }
  }

  const exercises: ProgressSnapshotDTO["exercises"] = {};
  if (obj.exercises && typeof obj.exercises === "object") {
    for (const [key, value] of Object.entries(obj.exercises as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      const exerciseSlug = typeof item.exerciseSlug === "string" ? item.exerciseSlug : "";
      const completedAt = typeof item.completedAt === "string" && ISO_RE.test(item.completedAt) ? item.completedAt : new Date().toISOString();
      if (!SLUG_RE.test(exerciseSlug) || key !== exerciseSlug) continue;
      if (item.completed !== true) continue;
      exercises[key] = { exerciseSlug, completed: true, completedAt };
    }
  }

  const learningDays = Array.isArray(obj.learningDays)
    ? obj.learningDays.filter((d): d is string => typeof d === "string" && DAY_RE.test(d)).slice(0, 3650)
    : [];

  const updatedAt = typeof obj.updatedAt === "string" && ISO_RE.test(obj.updatedAt) ? obj.updatedAt : undefined;

  return { lessons, exercises, learningDays, updatedAt };
}
