"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Bell, LogOut, User, Menu, ChevronDown } from "lucide-react";

import { TopBar as TopBarShell, TopBarActions, TopBarBreadcrumb } from "@/components/ui/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMobileSidebar } from "./MobileSidebarContext";

const SECTION_LABELS: { href: string; label: string }[] = [
  { href: "/dashboard/delivery-partners", label: "Delivery Partners" },
  { href: "/dashboard/shipments", label: "Shipments" },
  { href: "/dashboard/manifest", label: "Train Manifest" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/ledger", label: "Customer Ledger" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/expenses", label: "Expenses" },
  { href: "/dashboard/tracking", label: "Tracking" },
  { href: "/dashboard/reports", label: "Reports & P&L" },
  { href: "/dashboard/audit", label: "Audit Logs" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard", label: "Dashboard" },
];

function currentSectionLabel(pathname: string): string {
  const match = SECTION_LABELS.find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`));
  return match?.label ?? "Dashboard";
}

export function TopBar({ session }: { session: Session }) {
  const pathname = usePathname();
  const { setOpen: setMobileNavOpen } = useMobileSidebar();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  const section = currentSectionLabel(pathname);
  const breadcrumbItems = section === "Dashboard" ? [{ label: "Dashboard" }] : [{ label: "Dashboard" }, { label: section }];

  return (
    <TopBarShell>
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="shrink-0 rounded-ds-md p-1.5 text-ink-500 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
        <TopBarBreadcrumb items={breadcrumbItems} />
      </div>

      <TopBarActions>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-[18px]" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-status-critical" />
        </Button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-ds-md py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-ink-100"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-navy-600 text-xs font-semibold text-white">
              {session.user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-ink-700 sm:block">
              {session.user?.name?.split(" ")[0]}
            </span>
            <ChevronDown className="hidden size-3.5 text-ink-400 sm:block" strokeWidth={1.75} />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-ds-lg border border-ink-200 bg-white py-1.5 shadow-ds-md">
              <div className="border-b border-ink-100 px-3.5 py-2.5">
                <p className="truncate text-sm font-medium text-ink-900">{session.user?.name}</p>
                <p className="truncate text-xs text-ink-500">{session.user?.email}</p>
                {role === "SUPER_ADMIN" && (
                  <Badge variant="premium" className="mt-1.5">
                    Super Admin
                  </Badge>
                )}
              </div>
              <button className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-ink-700 transition-colors duration-150 hover:bg-ink-50">
                <User className="size-4" strokeWidth={1.75} /> Profile
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-status-critical transition-colors duration-150 hover:bg-status-critical/5"
              >
                <LogOut className="size-4" strokeWidth={1.75} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </TopBarActions>
    </TopBarShell>
  );
}
