"use client";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Printer, RotateCcw } from "lucide-react";

interface Props {
  entries: any[];
  customers: any[];
  searchParams: any;
}

export function LedgerClient({ entries, customers, searchParams }: Props) {
  const router = useRouter();

  function applyFilter(params: Record<string, string>) {
    const p = new URLSearchParams({ ...searchParams, ...params });
    router.push(`/dashboard/ledger?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/dashboard/ledger");
  }

  const customerId = searchParams.customerId ?? "";
  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const hasFilters = Boolean(customerId || from || to);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const totalBilled = entries.filter((e) => e.type === "SHIPMENT").reduce((s, e) => s + e.amount, 0);
  const totalPaid = entries.reduce((s, e) => s + e.paymentReceived, 0);
  const balance = totalBilled - totalPaid;

  function exportCSV() {
    const rows = [
      ["Date", "Type", "PCS", "Weight", "Rate", "Amount", "Payment Received", "Running Balance"],
      ...entries.map(e => [
        formatDate(e.date), e.type, e.pieces ?? "", e.weight ?? "",
        e.rate ?? "", e.amount, e.paymentReceived, e.runningBalance,
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${customerId || "all"}-${Date.now()}.csv`;
    a.click();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>
            Customer Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">
            {selectedCustomer ? selectedCustomer.name : "Customer account statements"}
          </p>
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Customer</label>
            <select value={customerId} onChange={e => applyFilter({ customerId: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-48 focus:outline-none">
              <option value="">All Customers</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={e => applyFilter({ from: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              <span className="text-gray-300">–</span>
              <input type="date" value={to} onChange={e => applyFilter({ to: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
          {hasFilters && (
            <button onClick={resetFilters}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-700">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Compact Summary Strip */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 px-1">
        <span>Total Billed <strong className="text-gray-900">{formatCurrency(totalBilled)}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Received <strong className="text-gray-900">{formatCurrency(totalPaid)}</strong></span>
        <span className="text-gray-300">•</span>
        <span>
          {balance > 0 ? "Outstanding" : "Overpaid"}{" "}
          <strong style={{ color: balance > 0 ? "#1E3A5F" : "#111827" }}>{formatCurrency(Math.abs(balance))}</strong>
        </span>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[74vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: "#DCE9F7" }}>
              <tr>
                {["Date", "Type", "PCS", "Weight (kg)", "Rate (₹/kg)", "Amount", "Payment Received", "Running Balance"].map((h, i) => (
                  <th key={h}
                    className={`px-3 py-2.5 text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 ${i === 0 || i === 1 ? "text-left" : "text-right"}`}
                    style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap md:px-4 md:py-4">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 font-medium">
                      {e.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm text-gray-700 md:px-4 md:py-4">{e.pieces ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right text-sm text-gray-700 md:px-4 md:py-4">{e.weight ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right text-sm text-gray-700 md:px-4 md:py-4">{e.rate ? `₹${e.rate}` : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-semibold text-gray-900 md:px-4 md:py-4">{formatCurrency(e.amount)}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-700 md:px-4 md:py-4">
                    {e.paymentReceived > 0 ? formatCurrency(e.paymentReceived) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm font-bold md:px-4 md:py-4"
                    style={{ color: e.runningBalance < 0 ? "#DC2626" : "#1E3A5F" }}>
                    {formatCurrency(e.runningBalance)}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No ledger entries found. Select a customer or adjust date filters.
                  </td>
                </tr>
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={5} className="px-3 py-2.5 font-semibold text-sm text-gray-700 md:px-4 md:py-3.5">TOTAL</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-sm text-gray-900 md:px-4 md:py-3.5">{formatCurrency(totalBilled)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-sm text-gray-900 md:px-4 md:py-3.5">{formatCurrency(totalPaid)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-sm md:px-4 md:py-3.5"
                    style={{ color: balance < 0 ? "#DC2626" : "#1E3A5F" }}>
                    {formatCurrency(balance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
