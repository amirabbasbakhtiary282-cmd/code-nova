import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            error ? "border-error focus:ring-error" : "",
            className,
          )}
          {...props}
        />

        {error ? <p className="text-xs text-error">{error}</p> : null}
        {!error && helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
