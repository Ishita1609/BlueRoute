import * as React from "react";
import { type LucideIcon, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

/** EmptyState — DESIGN_SYSTEM.md §8 (table empty state), reused anywhere content is absent. */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({ icon: Icon = Inbox, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}
      {...props}
    >
      <Icon className="size-6 text-ink-400" strokeWidth={1.5} />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink-800">{title}</p>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export { EmptyState };
