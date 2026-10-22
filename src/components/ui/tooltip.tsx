import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Tooltip({
  text,
  children,
  className,
}: HTMLAttributes<HTMLSpanElement> & { text: string }) {
  return (
    <span className={cn("cursor-help underline decoration-dotted", className)} title={text}>
      {children}
    </span>
  );
}
