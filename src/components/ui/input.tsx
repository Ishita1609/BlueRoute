import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input — DESIGN_SYSTEM.md §7
 * 36px height to align with Button's `md` size on the same row.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "flex h-9 w-full rounded-ds-md border bg-white px-3 text-sm text-ink-800 shadow-none transition-colors duration-150",
          "placeholder:text-ink-400",
          "border-ink-300 focus-visible:outline-none focus-visible:border-navy-600 focus-visible:shadow-ds-focus",
          "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:border-ink-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          error && "border-status-critical focus-visible:border-status-critical focus-visible:shadow-[0_0_0_3px_rgba(208,59,59,0.16)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
