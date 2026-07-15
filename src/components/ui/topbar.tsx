import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * TopBar primitives — DESIGN_SYSTEM.md §11.
 * Presentational only — not wired into the app's existing
 * `src/components/layout/TopBar.tsx` for this pass.
 */
const TopBar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "flex h-16 shrink-0 items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 md:px-6",
        className
      )}
      {...props}
    />
  )
);
TopBar.displayName = "TopBar";

const TopBarTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn("text-lg font-semibold leading-6 text-ink-900", className)} {...props} />
  )
);
TopBarTitle.displayName = "TopBarTitle";

export interface TopBarBreadcrumbItem {
  label: string;
  href?: string;
}

/** Renders items as plain text/links (caller controls navigation via `href` + its own Link). */
function TopBarBreadcrumb({
  items,
  renderItem,
  className,
}: {
  items: TopBarBreadcrumbItem[];
  renderItem?: (item: TopBarBreadcrumbItem, isLast: boolean) => React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={cn("flex min-w-0 items-center gap-1.5 text-sm text-ink-500", className)} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className={cn("min-w-0 items-center gap-1.5", isLast ? "flex" : "hidden md:flex")}>
            {renderItem ? (
              renderItem(item, isLast)
            ) : (
              <span className={cn("truncate", isLast ? "font-medium text-ink-800" : undefined)}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="hidden size-3.5 shrink-0 text-ink-300 md:block" />}
          </span>
        );
      })}
    </nav>
  );
}

const TopBarActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
);
TopBarActions.displayName = "TopBarActions";

export { TopBar, TopBarTitle, TopBarBreadcrumb, TopBarActions };
