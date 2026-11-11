import { lessonExercises } from "@/content/courses";
import { simpleCheck, type CodeBuffers } from "@/features/lab/exercise-check";

export type ExerciseSubmissionCheck =
  | { ok: true }
  | { ok: false; reason: "unknown-exercise" | "invalid-code" | "failed-check" };

/**
 * Re-run the same lightweight check on the server instead of trusting a
 * client-side `passed` flag. This is still an educational heuristic, not a
 * secure judge; the sandboxed preview is not an execution boundary either.
 */
export function checkExerciseSubmission(exerciseSlug: string, rawCode: unknown): ExerciseSubmissionCheck {
  const exercise = lessonExercises.find((item) => item.slug === exerciseSlug);
  if (!exercise) return { ok: false, reason: "unknown-exercise" };
  if (typeof rawCode !== "string" || rawCode.length === 0 || rawCode.length > 200_000) {
    return { ok: false, reason: "invalid-code" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawCode);
  } catch {
    return { ok: false, reason: "invalid-code" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid-code" };
  }

  const candidate = parsed as Record<string, unknown>;
  if (["html", "css", "js"].some((key) => typeof candidate[key] !== "string")) {
    return { ok: false, reason: "invalid-code" };
  }
  const buffers = candidate as unknown as CodeBuffers;

  return simpleCheck(exercise.language, buffers, exercise.starterCode, exercise.slug)
    ? { ok: true }
    : { ok: false, reason: "failed-check" };
}
