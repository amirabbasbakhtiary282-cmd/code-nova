import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories } from "@/server/repositories";

export const dynamic = "force-dynamic";

/** Authoritative progress snapshot for the logged-in user. */
export async function GET() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const progress = await getRepositories().progress.getSnapshot(userId);
  return NextResponse.json({ ok: true, progress });
}
