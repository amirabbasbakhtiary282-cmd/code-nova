import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "success" | "warning" | "error" | "info";

const styles: Record<Variant, string> = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  error: "border-error/40 bg-error/10 text-error",
  info: "border-info/40 bg-info/10 text-info",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div role="alert" className={cn("rounded-xl border p-3 text-sm", styles[variant], className)} {...props} />;
}
