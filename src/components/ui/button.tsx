import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Button — DESIGN_SYSTEM.md §6
 * One primary action per view; `primary` is the only variant that uses the
 * brand navy fill. `destructive` uses the shared status/critical color.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ds-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-ds-focus focus-visible:border-navy-600 disabled:pointer-events-none disabled:opacity-40 border border-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-navy-600 text-white hover:bg-navy-700 active:bg-navy-800",
        secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300",
        outline:
          "border-ink-300 bg-transparent text-ink-800 hover:bg-ink-50 hover:border-ink-400",
        ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
        destructive: "bg-status-critical text-white hover:bg-[#B93333] active:bg-[#A32E2E]",
        link: "bg-transparent text-navy-600 hover:underline p-0 h-auto font-medium",
      },
      size: {
        sm: "h-8 px-2.5 text-xs [&_svg]:size-3.5",
        md: "h-9 px-3.5 [&_svg]:size-4",
        lg: "h-10 px-[18px] text-[15px] [&_svg]:size-[18px]",
        icon: "h-9 w-9 p-0 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), variant === "link" && "h-auto")}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
