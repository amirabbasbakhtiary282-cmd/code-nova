// Defensive server-side validation of client-submitted progress snapshots.
// Never trust the shape coming from localStorage/clients.
import type { ProgressSnapshotDTO } from "@/server/repositories";

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9-]+$/i;
const MAX_LESSONS = 500;
const MAX_EXERCISES = 500;
const MAX_LEARNING_DAYS = 3650;

export function isValidProgressSlug(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength && SLUG_RE.test(value);
}

function isValidTimestamp(value: string): boolean {
  if (!ISO_RE.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value.slice(0, 10);
}

function isValidDay(value: string): boolean {
  if (!DAY_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function readEntries(value: unknown, maxEntries: number): Array<[string, unknown]> | null {
  if (value === undefined) return [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.length <= maxEntries ? entries : null;
}

export function sanitizeSnapshotInput(raw: unknown): ProgressSnapshotDTO | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const lessonEntries = readEntries(obj.lessons, MAX_LESSONS);
  const exerciseEntries = readEntries(obj.exercises, MAX_EXERCISES);
  if (!lessonEntries || !exerciseEntries) return null;

  const now = new Date().toISOString();
  const lessons: ProgressSnapshotDTO["lessons"] = {};
  for (const [key, value] of lessonEntries) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const item = value as Record<string, unknown>;
    const courseSlug = typeof item.courseSlug === "string" ? item.courseSlug : "";
    const lessonSlug = typeof item.lessonSlug === "string" ? item.lessonSlug : "";
    const completedAt = typeof item.completedAt === "string" && isValidTimestamp(item.completedAt) ? item.completedAt : now;
    if (!isValidProgressSlug(courseSlug, 120) || !isValidProgressSlug(lessonSlug, 120)) continue;
    if (item.completed !== true) continue;
    if (key !== `${courseSlug}:${lessonSlug}`) continue;
    lessons[key] = { courseSlug, lessonSlug, completed: true, completedAt };
  }

  const exercises: ProgressSnapshotDTO["exercises"] = {};
  for (const [key, value] of exerciseEntries) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const item = value as Record<string, unknown>;
    const exerciseSlug = typeof item.exerciseSlug === "string" ? item.exerciseSlug : "";
    const completedAt = typeof item.completedAt === "string" && isValidTimestamp(item.completedAt) ? item.completedAt : now;
    if (!isValidProgressSlug(exerciseSlug, 190) || key !== exerciseSlug) continue;
    if (item.completed !== true) continue;
    exercises[key] = { exerciseSlug, completed: true, completedAt };
  }

  const learningDays = Array.isArray(obj.learningDays)
    ? Array.from(new Set(obj.learningDays.filter((day): day is string => typeof day === "string" && isValidDay(day)))).slice(
        0,
        MAX_LEARNING_DAYS,
      )
    : [];

  const updatedAt = typeof obj.updatedAt === "string" && isValidTimestamp(obj.updatedAt) ? obj.updatedAt : undefined;

  return { lessons, exercises, learningDays, updatedAt };
}
