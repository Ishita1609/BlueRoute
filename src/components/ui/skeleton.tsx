import * as React from "react";

import { cn } from "@/lib/utils";

/** Skeleton — DESIGN_SYSTEM.md §11 loading state. Match the shape of the content it replaces. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-ds-sm bg-ink-100", className)} {...props} />;
}

/** A row of skeletons matching Table's default 44px row height. */
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-11 items-center gap-4 border-b border-ink-200 px-4 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" style={{ maxWidth: c === 0 ? "40%" : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton matching a StatsCard's shape. */
function StatsCardSkeleton() {
  return (
    <div className="rounded-ds-lg border border-ink-200 bg-white p-4">
      <Skeleton className="mb-3 h-3.5 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

export { Skeleton, TableSkeleton, StatsCardSkeleton };
