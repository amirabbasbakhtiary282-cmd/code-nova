import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories, isRepositoryNotFoundError } from "@/server/repositories";
import { isValidProgressSlug } from "@/server/services/progress-validation";
import { checkExerciseSubmission } from "@/server/services/exercise-validation";

export const dynamic = "force-dynamic";

/** REST mirror of the syncExerciseComplete server action (used by E2E tests). */
export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: "request body must be a JSON object" }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  const exerciseSlug = typeof body.exerciseSlug === "string" ? body.exerciseSlug : "";
  if (!isValidProgressSlug(exerciseSlug, 190)) {
    return NextResponse.json({ ok: false, error: "exerciseSlug must be a valid slug" }, { status: 400 });
  }
  if (typeof body.code !== "string") {
    return NextResponse.json({ ok: false, error: "code must be a JSON-encoded editor snapshot" }, { status: 400 });
  }
  if (body.code.length > 200_000) {
    return NextResponse.json({ ok: false, error: "code is too large" }, { status: 413 });
  }

  const check = checkExerciseSubmission(exerciseSlug, body.code);
  if (!check.ok) {
    const status = check.reason === "unknown-exercise" ? 404 : check.reason === "failed-check" ? 422 : 400;
    return NextResponse.json({ ok: false, error: check.reason }, { status });
  }

  try {
    await getRepositories().progress.markExerciseComplete(userId, exerciseSlug, body.code);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isRepositoryNotFoundError(error)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("[api/progress/exercise]", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
