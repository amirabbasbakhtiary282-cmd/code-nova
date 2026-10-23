import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories, RepositoryNotFoundError } from "@/server/repositories";

export const dynamic = "force-dynamic";

/** REST mirror of the syncLessonComplete server action (used by E2E tests). */
export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { courseSlug?: unknown; lessonSlug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : "";
  const lessonSlug = typeof body.lessonSlug === "string" ? body.lessonSlug : "";
  if (!courseSlug || !lessonSlug) {
    return NextResponse.json({ ok: false, error: "courseSlug and lessonSlug are required" }, { status: 400 });
  }

  try {
    await getRepositories().progress.markLessonComplete(userId, courseSlug, lessonSlug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RepositoryNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("[api/progress/lesson]", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
