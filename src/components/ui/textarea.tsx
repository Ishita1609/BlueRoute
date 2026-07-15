import * as React from "react";

import { cn } from "@/lib/utils";

/** Textarea — DESIGN_SYSTEM.md §7 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-ds-md border bg-white px-3 py-2 text-sm text-ink-800 transition-colors duration-150",
          "placeholder:text-ink-400",
          "border-ink-300 focus-visible:outline-none focus-visible:border-navy-600 focus-visible:shadow-ds-focus",
          "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:border-ink-200",
          error && "border-status-critical focus-visible:border-status-critical focus-visible:shadow-[0_0_0_3px_rgba(208,59,59,0.16)]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
