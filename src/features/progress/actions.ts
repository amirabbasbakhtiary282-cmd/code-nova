"use server";

// Server Actions for syncing client progress into the database.
// Guests (no session) get { synced: false } — their localStorage remains the
// store of record. Logged-in users get their completions persisted server-side.
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getRepositories, isRepositoryNotFoundError } from "@/server/repositories";
import type { ProgressSnapshotDTO } from "@/server/repositories";
import { isValidProgressSlug, sanitizeSnapshotInput } from "@/server/services/progress-validation";
import { checkExerciseSubmission } from "@/server/services/exercise-validation";

function sessionUserId(session: Session | null): number | null {
  const id = Number(session?.user?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function syncLessonComplete(courseSlug: string, lessonSlug: string): Promise<{ synced: boolean }> {
  if (!isValidProgressSlug(courseSlug, 120) || !isValidProgressSlug(lessonSlug, 120)) return { synced: false };
  const userId = sessionUserId(await auth());
  if (!userId) return { synced: false };

  try {
    await getRepositories().progress.markLessonComplete(userId, courseSlug, lessonSlug);
    return { synced: true };
  } catch (error) {
    if (isRepositoryNotFoundError(error)) return { synced: false };
    console.error("[progress-actions] markLessonComplete failed:", error);
    return { synced: false };
  }
}

export async function syncExerciseComplete(exerciseSlug: string, code: string): Promise<{ synced: boolean }> {
  if (!isValidProgressSlug(exerciseSlug, 190)) return { synced: false };
  if (!checkExerciseSubmission(exerciseSlug, code).ok) return { synced: false };
  const userId = sessionUserId(await auth());
  if (!userId) return { synced: false };

  try {
    await getRepositories().progress.markExerciseComplete(userId, exerciseSlug, code);
    return { synced: true };
  } catch (error) {
    if (isRepositoryNotFoundError(error)) return { synced: false };
    console.error("[progress-actions] markExerciseComplete failed:", error);
    return { synced: false };
  }
}

/** Merge a full client snapshot (guest → login migration) and return the DB truth. */
export async function syncProgressSnapshot(raw: unknown): Promise<{ synced: boolean; progress?: ProgressSnapshotDTO }> {
  const userId = sessionUserId(await auth());
  const snapshot = sanitizeSnapshotInput(raw);
  if (!userId || !snapshot) return { synced: false };

  try {
    const progress = await getRepositories().progress.mergeSnapshot(userId, snapshot);
    return { synced: true, progress };
  } catch (error) {
    console.error("[progress-actions] mergeSnapshot failed:", error);
    return { synced: false };
  }
}
