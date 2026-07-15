import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — DESIGN_SYSTEM.md §1.5
 * `success`/`warning`/`serious`/`critical` are the fixed status tokens shared
 * with charts (§14) — do not repurpose them for anything but state. `premium`
 * is the restrained gold accent (§1.4) — use only for VIP/enterprise tags.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-4 w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-ink-200 bg-ink-100 text-ink-700",
        info: "border-navy-100 bg-navy-50 text-navy-700",
        success: "border-[#0CA30C]/20 bg-[#0CA30C]/10 text-[#0A7A0A]",
        warning: "border-status-warning/20 bg-status-warning/10 text-status-warning",
        serious: "border-status-serious/20 bg-status-serious/10 text-status-serious",
        critical: "border-status-critical/20 bg-status-critical/10 text-status-critical",
        premium: "border-gold-500/30 bg-gold-50 text-gold-700",
        outline: "border-ink-300 bg-transparent text-ink-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
