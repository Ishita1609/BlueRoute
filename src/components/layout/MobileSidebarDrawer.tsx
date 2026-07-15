"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { X, Boxes } from "lucide-react";

import { useMobileSidebar } from "./MobileSidebarContext";
import { GROUPS, navItems } from "./Sidebar";
import {
  SidebarHeader,
  SidebarBody,
  SidebarSection,
  SidebarNavItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Mobile/tablet drawer (lg:hidden) — reuses the same nav data and primitives as
// the desktop Sidebar (which stays untouched, hidden below lg). This is the
// only place mobile/tablet navigation is rendered.
export function MobileSidebarDrawer({ session }: { session: Session }) {
  const { open, setOpen } = useMobileSidebar();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officeName = (session.user as any).officeName;

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close after navigation.
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] max-w-[80vw] flex-col bg-sidebar transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <SidebarHeader className="justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Boxes className="size-[18px] text-white" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-[15px] font-bold leading-tight tracking-tight text-white">BlueRoute Logistics</p>
              <p className="mt-0.5 truncate text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-white/55">
                Logistics ERP
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="shrink-0 rounded-ds-sm p-1 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </SidebarHeader>

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

        <SidebarBody>
          {GROUPS.map((group) => {
            const items = visibleItems.filter((item) => item.group === group);
            if (items.length === 0) return null;
            return (
              <SidebarSection key={group} label={group}>
                {items.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SidebarNavItem key={item.href} icon={item.icon} active={isActive} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </SidebarNavItem>
                  );
                })}
              </SidebarSection>
            );
          })}
        </SidebarBody>

        <SidebarFooter>
          <p className="text-xs text-white/35">BlueRoute Logistics ERP v1.0</p>
        </SidebarFooter>
      </aside>
    </>
  );
}
