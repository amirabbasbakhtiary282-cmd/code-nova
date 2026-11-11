"use client";

// Bridges the client progress store and the database for logged-in users:
// 1. migrate the legacy guest snapshot into the authenticated user's local store
// 2. push that user-scoped snapshot to the server
// 3. merge the authoritative DB snapshot back into the same store
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { clearGuestProgress, getProgress, mergeProgress } from "@/features/progress/storage";
import { syncProgressSnapshot } from "@/features/progress/actions";

export function ProgressSync() {
  const { data: session, status } = useSession();
  const userId = status === "authenticated" && session?.user?.id ? String(session.user.id) : null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        // The v1 unscoped key is the guest store and may contain history from
        // before this account existed. Copy it first, then clear it only after
        // the account-scoped copy is durable (or the server confirms the merge).
        const guestSnapshot = getProgress();
        const guestCopiedLocally = mergeProgress(guestSnapshot, userId);
        if (guestCopiedLocally) clearGuestProgress();

        const result = await syncProgressSnapshot(getProgress(userId));
        if (cancelled || !result.synced || !result.progress) return;

        mergeProgress(
          {
            lessons: result.progress.lessons,
            exercises: result.progress.exercises,
            learningDays: result.progress.learningDays,
            updatedAt: result.progress.updatedAt,
          },
          userId,
        );

        // If localStorage was unavailable during the first copy, the successful
        // server merge is now the durable copy and the shared guest key is safe
        // to clear. If the server is offline, keep the guest data for retry.
        if (!guestCopiedLocally) clearGuestProgress();
      } catch (error) {
        console.warn("[progress-sync] sync failed (local progress is kept):", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
