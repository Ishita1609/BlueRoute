import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** SearchBar — a composed Input with a search icon, clear button, and optional loading state. */
export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void;
  loading?: boolean;
  containerClassName?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, value, onClear, loading = false, placeholder = "Search…", ...props }, ref) => {
    const hasValue = typeof value === "string" ? value.length > 0 : Boolean(value);
    return (
      <div className={cn("relative flex-1 min-w-0", containerClassName)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" strokeWidth={1.5} />
        <input
          ref={ref}
          type="search"
          value={value}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-ds-md border border-ink-300 bg-white pl-9 pr-9 text-sm text-ink-800 transition-colors duration-150",
            "placeholder:text-ink-400",
            "focus-visible:outline-none focus-visible:border-navy-600 focus-visible:shadow-ds-focus",
            "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
            "[&::-webkit-search-cancel-button]:appearance-none",
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="size-4 animate-spin text-ink-400" />
          ) : (
            hasValue &&
            onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-ink-400 transition-colors hover:text-ink-700"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )
          )}
        </div>
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export { SearchBar };
