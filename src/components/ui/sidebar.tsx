import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Sidebar primitives — DESIGN_SYSTEM.md §10.
 * Presentational building blocks only — not wired into the app's existing
 * `src/components/layout/Sidebar.tsx`, which keeps its current nav data,
 * routing, and role-gating logic untouched for this pass.
 */
export interface SidebarShellProps extends React.HTMLAttributes<HTMLElement> {
  /** Icon-only rail (68px) instead of the full 250px width. */
  collapsed?: boolean;
}

const SidebarShell = React.forwardRef<HTMLElement, SidebarShellProps>(
  ({ collapsed = false, className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[250px]",
        className
      )}
      {...props}
    />
  )
);
SidebarShell.displayName = "SidebarShell";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-20 shrink-0 items-center gap-2 px-6", className)} {...props} />
  )
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-3 py-3", className)} {...props} />
  )
);
SidebarBody.displayName = "SidebarBody";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string; collapsed?: boolean }
>(({ label, collapsed = false, className, children, ...props }, ref) => (
  <div ref={ref} className={cn("mt-10 first:mt-0", className)} {...props}>
    {label && !collapsed && (
      <p className="mb-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-white/60">{label}</p>
    )}
    <div className="flex flex-col gap-0.5">{children}</div>
  </div>
));
SidebarSection.displayName = "SidebarSection";

export interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
  badge?: React.ReactNode;
  asChild?: boolean;
}

const SidebarNavItem = React.forwardRef<HTMLButtonElement, SidebarNavItemProps>(
  ({ icon: Icon, active = false, collapsed = false, badge, asChild = false, className, children, ...props }, ref) => {
    const itemClassName = cn(
      "group relative flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/[0.82] transition-colors duration-150",
      "hover:bg-white/[0.07] hover:text-white",
      "data-[active]:bg-white/[0.12] data-[active]:text-white data-[active]:hover:bg-white/[0.12]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
      collapsed && "justify-center px-0",
      className
    );

    const iconEl = Icon && (
      <Icon
        className="size-[18px] shrink-0 text-sidebar-icon/[0.72] transition-colors duration-150 group-hover:text-white group-data-[active]:text-white"
        strokeWidth={1.5}
      />
    );

    if (asChild) {
      // Radix Slot requires exactly one React element child. We can't render
      // the icon / label / badge as siblings inside <Slot> the way the plain
      // <button> path does below — instead we clone the single child (e.g. a
      // <Link>) and replace *its* children with our composed content, using
      // the child's original children as the label text. Slot then merges
      // itemClassName/data-active/...props onto that one clone.
      const child = React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      const label = child.props.children;

      return (
        <Slot ref={ref} data-active={active || undefined} className={itemClassName} {...props}>
          {React.cloneElement(
            child,
            undefined,
            <>
              {iconEl}
              {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
              {!collapsed && badge}
            </>
          )}
        </Slot>
      );
    }

    return (
      <button ref={ref} data-active={active || undefined} className={itemClassName} {...props}>
        {iconEl}
        {!collapsed && <span className="flex-1 truncate text-left">{children}</span>}
        {!collapsed && badge}
      </button>
    );
  }
);
SidebarNavItem.displayName = "SidebarNavItem";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0 border-t border-sidebar-border p-3", className)} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

export { SidebarShell, SidebarHeader, SidebarBody, SidebarSection, SidebarNavItem, SidebarFooter };
