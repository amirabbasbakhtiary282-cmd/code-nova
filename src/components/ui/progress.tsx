import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated", className)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${safe}%` }} />
    </div>
  );
}
