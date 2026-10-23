import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { getDb, getDbFile } from "@/db/client";
import { courses } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const report: {
    ok: boolean;
    db: { driver: "sqlite"; file: string; reachable: boolean; courses?: number; error?: string };
  } = {
    ok: false,
    db: { driver: "sqlite", file: getDbFile(), reachable: false },
  };

  try {
    const db = getDb();
    const row = db.select({ n: count() }).from(courses).get();
    report.db.reachable = true;
    report.db.courses = row?.n ?? 0;
    report.ok = true;
  } catch (error) {
    report.db.error = error instanceof Error ? error.message : String(error);
    console.error("[health] database check failed:", error);
  }

  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
