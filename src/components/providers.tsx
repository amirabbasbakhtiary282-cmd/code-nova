"use client";

// Client providers kept OUT of the root layout module itself (the layout is a
// server component); SessionProvider requires a client boundary.
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ProgressSync } from "@/features/progress/progress-sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ProgressSync />
    </SessionProvider>
  );
}
