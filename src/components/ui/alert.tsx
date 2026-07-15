import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/** Alert — DESIGN_SYSTEM.md §1.5 status tokens, in banner form. */
const alertVariants = cva(
  "relative w-full rounded-ds-md border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:size-4 [&>svg+div]:pl-7",
  {
    variants: {
      variant: {
        info: "border-navy-100 bg-navy-50 text-navy-800 [&>svg]:text-navy-600",
        success: "border-[#0CA30C]/20 bg-[#0CA30C]/5 text-[#0A5F0A] [&>svg]:text-[#0CA30C]",
        warning: "border-status-warning/25 bg-status-warning/5 text-[#8A5A0A] [&>svg]:text-status-warning",
        critical: "border-status-critical/25 bg-status-critical/5 text-[#9C2E2E] [&>svg]:text-status-critical",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const variantIcon = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Set false to omit the leading status icon. */
  icon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", icon = true, children, ...props }, ref) => {
    const Icon = variantIcon[variant ?? "info"];
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {icon && <Icon />}
        <div>{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
