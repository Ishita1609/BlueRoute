"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Download, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuditRow {
  id: string;
  dateStr: string;
  timeStr: string;
  userName: string;
  userEmail: string;
  activity: string;
}

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function AuditLogsMenu({ rows }: { rows: AuditRow[] }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function exportCsv() {
    const headers = ["Date", "Time", "User", "Email", "Activity"];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [r.dateStr, r.timeStr, r.userName, r.userEmail, r.activity].map(escapeCsvValue).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export ready", description: `audit-logs-${today}.csv has been downloaded.`, variant: "success" });
  }

  // Kept identical to the previous standalone "Clear Audit Logs" button's
  // implementation — same endpoint, same dialog copy, same behavior. Only
  // the trigger moved into this dropdown.
  async function handleClear() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({
        title: "Audit logs cleared",
        description: "All audit log entries have been permanently removed.",
        variant: "success",
      });
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Failed to clear logs", description: "Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            aria-label="More options"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-gray-100"
          >
            <MoreVertical className="size-[18px]" strokeWidth={1.75} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-[220px] rounded-xl border border-[#E8E8E8] bg-white p-2 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150"
          >
            <DropdownMenu.Item
              onSelect={exportCsv}
              className="flex h-10 cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-gray-700 outline-none transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50"
            >
              <Download className="size-4 text-gray-500" strokeWidth={1.75} />
              Export CSV
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              onSelect={() => setConfirmOpen(true)}
              className="flex h-10 cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-red-600 outline-none transition-colors duration-150 hover:bg-red-50 focus:bg-red-50"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
              Clear Audit Logs
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Clear Audit Logs</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              This will permanently remove every audit log entry.
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Clearing..." : "Clear Logs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
