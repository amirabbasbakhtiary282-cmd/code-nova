import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 shadow-[0_24px_60px_-28px_rgba(7,10,20,0.9),0_8px_20px_-12px_rgba(99,102,241,0.4)]",
        className,
      )}
      {...props}
    />
  );
}
