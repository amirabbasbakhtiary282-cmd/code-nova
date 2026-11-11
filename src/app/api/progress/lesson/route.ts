import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories, isRepositoryNotFoundError } from "@/server/repositories";
import { isValidProgressSlug } from "@/server/services/progress-validation";

export const dynamic = "force-dynamic";

/** REST mirror of the syncLessonComplete server action (used by E2E tests). */
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
  const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : "";
  const lessonSlug = typeof body.lessonSlug === "string" ? body.lessonSlug : "";
  if (!isValidProgressSlug(courseSlug, 120) || !isValidProgressSlug(lessonSlug, 120)) {
    return NextResponse.json({ ok: false, error: "courseSlug and lessonSlug must be valid slugs" }, { status: 400 });
  }

  try {
    await getRepositories().progress.markLessonComplete(userId, courseSlug, lessonSlug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isRepositoryNotFoundError(error)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("[api/progress/lesson]", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
