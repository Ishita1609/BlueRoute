import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * FilterBar — a toolbar row for search + filter controls above a table or
 * chart. Purely a layout/composition shell: filter state and options are
 * owned by the caller and passed in as children (SearchBar, Select, etc.).
 */
const FilterBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  )
);
FilterBar.displayName = "FilterBar";

/** Right-aligned (or wraps to a new line) cluster for secondary actions like "Clear filters". */
const FilterBarActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ml-auto flex items-center gap-2", className)} {...props} />
  )
);
FilterBarActions.displayName = "FilterBarActions";

export interface ActiveFilterChipProps {
  label: string;
  onRemove: () => void;
}

/** A single removable "Status: Delayed ×" chip summarizing an applied filter. */
function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-navy-100 bg-navy-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-navy-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-800"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function FilterBarClearButton({ onClick, count }: { onClick: () => void; count?: number }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-ink-500 hover:text-ink-800">
      Clear filters{typeof count === "number" ? ` (${count})` : ""}
    </Button>
  );
}

export { FilterBar, FilterBarActions, ActiveFilterChip, FilterBarClearButton };
