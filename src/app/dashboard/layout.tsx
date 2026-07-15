import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileSidebarProvider } from "@/components/layout/MobileSidebarContext";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <MobileSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-ink-50">
        <Sidebar session={session} />
        <MobileSidebarDrawer session={session} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar session={session} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
