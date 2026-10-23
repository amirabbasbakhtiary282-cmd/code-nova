import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories, RepositoryNotFoundError } from "@/server/repositories";

export const dynamic = "force-dynamic";

/** REST mirror of the syncExerciseComplete server action (used by E2E tests). */
export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { exerciseSlug?: unknown; code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const exerciseSlug = typeof body.exerciseSlug === "string" ? body.exerciseSlug : "";
  const code = typeof body.code === "string" ? body.code : "";
  if (!exerciseSlug) {
    return NextResponse.json({ ok: false, error: "exerciseSlug is required" }, { status: 400 });
  }

  try {
    await getRepositories().progress.markExerciseComplete(userId, exerciseSlug, code);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RepositoryNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("[api/progress/exercise]", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
