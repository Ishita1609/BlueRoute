"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  Package,
  Users,
  BookOpen,
  CreditCard,
  Receipt,
  Train,
  Navigation,
  BarChart3,
  Settings,
  FileText,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarShell,
  SidebarHeader,
  SidebarBody,
  SidebarSection,
  SidebarNavItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

type NavGroup = "Overview" | "Operations" | "Accounts" | "Admin";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
  group: NavGroup;
}

export const GROUPS: NavGroup[] = ["Overview", "Operations", "Accounts", "Admin"];

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { href: "/dashboard/shipments", label: "Shipments", icon: Package, group: "Operations" },
  { href: "/dashboard/manifest", label: "Train Manifest", icon: Train, group: "Operations" },
  { href: "/dashboard/tracking", label: "Tracking", icon: Navigation, group: "Operations" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, group: "Accounts" },
  { href: "/dashboard/ledger", label: "Customer Ledger", icon: BookOpen, group: "Accounts" },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard, group: "Accounts" },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt, group: "Accounts" },
  { href: "/dashboard/reports", label: "Reports & P&L", icon: BarChart3, roles: ["SUPER_ADMIN"], group: "Admin" },
  { href: "/dashboard/audit", label: "Audit Logs", icon: FileText, roles: ["SUPER_ADMIN"], group: "Admin" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"], group: "Admin" },
];

export function Sidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officeName = (session.user as any).officeName;
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <SidebarShell collapsed={collapsed} className="hidden lg:flex">
      <SidebarHeader className="justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Boxes className="size-[18px] text-white" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-white">BlueRoute Logistics</p>
              <p className="mt-0.5 truncate text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-white/55">
                Logistics ERP
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="shrink-0 rounded-ds-sm p-1 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose className="size-4" strokeWidth={1.75} />
          </button>
        )}
      </SidebarHeader>

      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="rounded-ds-sm p-1 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Signed in as</p>
          <p className="truncate text-sm font-medium text-white">{session.user?.name}</p>
          {officeName && <p className="mt-0.5 truncate text-xs text-white/60">{officeName}</p>}
          {role === "SUPER_ADMIN" && (
            <span className="mt-1.5 inline-flex items-center rounded-full border border-white/30 px-2 py-0.5 text-[11px] font-medium text-white/90">
              Super Admin
            </span>
          )}
        </div>
      )}

      <SidebarBody>
        {GROUPS.map((group) => {
          const items = visibleItems.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <SidebarSection key={group} label={group} collapsed={collapsed}>
              {items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarNavItem
                    key={item.href}
                    icon={item.icon}
                    active={isActive}
                    collapsed={collapsed}
                    title={collapsed ? item.label : undefined}
                    asChild
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarNavItem>
                );
              })}
            </SidebarSection>
          );
        })}
      </SidebarBody>

      {!collapsed && (
        <SidebarFooter>
          <p className="text-xs text-white/35">BlueRoute Logistics ERP v1.0</p>
        </SidebarFooter>
      )}
    </SidebarShell>
  );
}
