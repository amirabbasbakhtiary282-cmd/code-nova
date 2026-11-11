"use client";

// Bridges the client progress store and the database for logged-in users:
// 1. pushes the local snapshot (guest history) to the server — idempotent merge
// 2. pulls the authoritative DB snapshot back and merges it into localStorage
// Guests are untouched: localStorage remains their store of record.
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getProgress, mergeProgress } from "@/features/progress/storage";
import { syncProgressSnapshot } from "@/features/progress/actions";

export function ProgressSync() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    (async () => {
      try {
        const result = await syncProgressSnapshot(getProgress());
        if (!cancelled && result.synced && result.progress) {
          mergeProgress({
            lessons: result.progress.lessons,
            exercises: result.progress.exercises,
            learningDays: result.progress.learningDays,
            updatedAt: result.progress.updatedAt,
          });
        }
      } catch (error) {
        console.warn("[progress-sync] sync failed (local progress is kept):", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}
