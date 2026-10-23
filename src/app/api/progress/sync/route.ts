import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositories } from "@/server/repositories";
import { sanitizeSnapshotInput } from "@/server/services/progress-validation";

export const dynamic = "force-dynamic";

/**
 * Merges a client snapshot (e.g. guest localStorage history) into the DB and
 * returns the resulting authoritative snapshot. Idempotent.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const snapshot = sanitizeSnapshotInput((body as { progress?: unknown })?.progress);
  if (!snapshot) {
    return NextResponse.json({ ok: false, error: "invalid progress snapshot" }, { status: 400 });
  }

  const progress = await getRepositories().progress.mergeSnapshot(userId, snapshot);
  return NextResponse.json({ ok: true, progress });
}
