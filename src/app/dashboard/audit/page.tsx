import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, Activity as ActivityIcon, Inbox } from "lucide-react";
import { AuditLogsMenu } from "@/components/audit/AuditLogsMenu";

function entityLabel(entity: string): string {
  return entity.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

function entityDisplayName(log: { entity: string; oldValue: unknown; newValue: unknown }): string | null {
  const data = (log.newValue ?? log.oldValue) as Record<string, unknown> | null;
  if (!data || typeof data !== "object") return null;
  if (log.entity === "Shipment") return typeof data.trackingNumber === "string" ? data.trackingNumber : null;
  return typeof data.name === "string" ? data.name : null;
}

function activitySentence(log: { action: string; entity: string; oldValue: unknown; newValue: unknown }): string {
  const verb =
    log.action === "CREATE" ? "Created" :
    log.action === "UPDATE" ? "Updated" :
    log.action === "DELETE" ? "Deleted" :
    log.action.charAt(0) + log.action.slice(1).toLowerCase();
  const label = entityLabel(log.entity);
  const name = entityDisplayName(log);
  return name ? `${verb} ${label} "${name}"` : `${verb} ${label}`;
}

function ActionIcon({ action }: { action: string }) {
  if (action === "CREATE") return <Plus className="size-4 shrink-0 text-green-600" strokeWidth={2} />;
  if (action === "UPDATE") return <Pencil className="size-4 shrink-0" strokeWidth={2} style={{ color: "#1E3A5F" }} />;
  if (action === "DELETE") return <Trash2 className="size-4 shrink-0 text-red-500" strokeWidth={2} />;
  return <ActivityIcon className="size-4 shrink-0 text-gray-400" strokeWidth={2} />;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const pageSize = 30;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Precomputed once, used for both the on-screen table and the CSV export
  // below, so "export exactly what is visible" is guaranteed by construction.
  const displayRows = logs.map((log) => {
    const d = new Date(log.timestamp);
    return {
      id: log.id,
      action: log.action,
      dateStr: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      timeStr: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
      userName: log.user?.name ?? "Unknown user",
      userEmail: log.user?.email ?? "",
      activity: activitySentence(log),
    };
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[36px]" style={{ color: "#1E3A5F" }}>Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[15px]">{total} audit events recorded</p>
        </div>
        <AuditLogsMenu rows={displayRows} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <Inbox className="size-8 text-gray-300" strokeWidth={1.5} />
            <p className="text-base font-semibold text-gray-800">Audit Logs</p>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              No activity has been recorded yet. System events will appear here once users begin working with the ERP.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Timestamp", "User", "Activity"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide md:px-5 md:py-3.5 md:text-[13px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                    <td className="px-3 py-2.5 align-top whitespace-nowrap md:px-5 md:py-4">
                      <p className="text-xs font-medium text-gray-800 md:text-[13px]">{row.dateStr}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.timeStr}</p>
                    </td>
                    <td className="px-3 py-2.5 align-top md:px-5 md:py-4">
                      <p className="text-sm font-semibold text-gray-800">{row.userName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.userEmail}</p>
                    </td>
                    <td className="px-3 py-2.5 align-top md:px-5 md:py-4">
                      <div className="flex items-center gap-2.5">
                        <ActionIcon action={row.action} />
                        <span className="text-sm font-medium text-gray-700">{row.activity}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 md:px-5 md:py-3.5">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <a key={p} href={`/dashboard/audit?page=${p}`}
                  className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors duration-150 ${p === page ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={p === page ? { background: "#1E3A5F" } : {}}>
                  {p}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
