"use client";
import { useRouter } from "next/navigation";
import { Printer, Download, RotateCcw, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  manifests: any[];
  trainShipments: any[];
  offices: any[];
  filterDate: string;
  filterOffice: string;
  role: string;
}

const COLUMNS: { label: string; align: "left" | "right" }[] = [
  { label: "S.No.", align: "left" },
  { label: "Consignor (From)", align: "left" },
  { label: "Consignee (To)", align: "left" },
  { label: "Origin", align: "left" },
  { label: "Destination", align: "left" },
  { label: "PCS", align: "right" },
  { label: "Weight (kg)", align: "right" },
  { label: "Rate (₹/kg)", align: "right" },
  { label: "Amount (₹)", align: "right" },
  { label: "Status", align: "left" },
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "BOOKED": return "bg-white text-gray-600 border-gray-300";
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY": return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "DELIVERED": return "bg-green-50 text-green-700 border-green-200";
    case "CANCELLED":
    case "RETURNED": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-white text-gray-600 border-gray-300";
  }
}

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function ManifestClient({ trainShipments, offices, filterDate, filterOffice, role }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  function applyFilter(params: Record<string, string>) {
    const p = new URLSearchParams({ date: filterDate, officeId: filterOffice, ...params });
    router.push(`/dashboard/manifest?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/dashboard/manifest");
  }

  const totalPackets = trainShipments.reduce((s, sh) => s + sh.packets, 0);
  const totalWeight = trainShipments.reduce((s, sh) => s + sh.weight, 0);
  const totalAmount = trainShipments.reduce((s, sh) => s + sh.amount, 0);

  const hasFilters = Boolean(filterDate !== today || (role === "SUPER_ADMIN" && filterOffice));

  function exportCSV() {
    const headers = ["S.No.", "Consignor (From)", "Consignee (To)", "Origin", "Destination", "PCS", "Weight (kg)", "Rate (Rs/kg)", "Amount (Rs)", "Status"];
    const rows = trainShipments.map((s, i) => [
      String(i + 1),
      s.customer?.name ?? "",
      s.customer?.city ?? "",
      s.fromCity,
      s.toCity,
      String(s.packets),
      s.weight.toFixed(2),
      s.rate.toFixed(2),
      s.amount.toFixed(2),
      s.status.replace(/_/g, " "),
    ]);
    const lines = [headers, ...rows].map((r) => r.map((v) => escapeCsvValue(v)).join(","));
    const csv = "﻿" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `train-manifest-${filterDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-[32px] font-bold leading-tight" style={{ color: "#1E3A5F" }}>
            Daily Train Manifest
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Traditional ledger-style train cargo manifest, generated automatically from Train-mode shipments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
            style={{ color: "#1E3A5F" }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
            style={{ color: "#1E3A5F" }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 no-print">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => applyFilter({ date: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
          {role === "SUPER_ADMIN" && (
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Office</label>
              <select
                value={filterOffice}
                onChange={(e) => applyFilter({ officeId: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              >
                <option value="">All Offices</option>
                {offices.map((o) => <option key={o.id} value={o.id}>{o.city}</option>)}
              </select>
            </div>
          )}
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-700">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Compact Summary Strip */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 px-1">
        <span>Total Consignments <strong className="text-gray-900">{trainShipments.length}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Total Pieces <strong className="text-gray-900">{totalPackets}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Total Weight <strong className="text-gray-900">{totalWeight.toFixed(2)} kg</strong></span>
        <span className="text-gray-300">•</span>
        <span>Total Amount <strong className="text-gray-900">{formatCurrency(totalAmount)}</strong></span>
      </div>

      {trainShipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 px-6 text-center">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-sm text-gray-700">No train shipments found</p>
          <p className="text-sm text-gray-400 mt-1">Train shipments created for this date will automatically appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-[74vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10" style={{ background: "#DCE9F7" }}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.label}
                      className={`px-4 py-4 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 ${col.align === "left" ? "text-left" : "text-right"}`}
                      style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trainShipments.map((s, i) => (
                  <tr key={s.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{s.customer?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.customer?.city || "—"}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.fromCity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.toCity}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-700">{s.packets}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-700">{s.weight.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-700">{s.rate.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">{s.amount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border-[1.5px] ${statusBadgeClass(s.status)}`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={5} className="px-4 py-4 font-semibold text-sm text-gray-700">TOTAL</td>
                  <td className="px-4 py-4 text-right font-semibold text-sm text-gray-900">{totalPackets}</td>
                  <td className="px-4 py-4 text-right font-semibold text-sm text-gray-900">{totalWeight.toFixed(2)}</td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right font-semibold text-sm" style={{ color: "#1E3A5F" }}>
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="px-4 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
