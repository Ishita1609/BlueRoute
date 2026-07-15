"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, ChevronUp, ChevronDown, RotateCcw, Pencil, Trash2, AlertTriangle, Download, Loader2,
} from "lucide-react";
import { formatCurrency, formatDate, getPaymentModeLabel } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const MODES = ["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CREDIT"];

const SORT_COLUMNS: { key: string; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "amount", label: "Amount" },
  { key: "mode", label: "Mode" },
];

interface Props {
  payments: any[];
  total: number;
  totalAmount: number;
  customers: any[];
  page: number;
  pageSize: number;
  searchParams: any;
}

export function PaymentsClient({ payments, total, totalAmount, customers, page, pageSize, searchParams }: Props) {
  const router = useRouter();
  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    customerId: "", amount: "", mode: "CASH", referenceNo: "", remarks: "",
  };
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  function applyFilter(params: Record<string, string>) {
    const p = new URLSearchParams({ ...searchParams, ...params });
    router.push(`/dashboard/payments?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/dashboard/payments");
  }

  function toggleSort(key: string) {
    const currentSort = searchParams.sortBy ?? "date";
    const currentDir = searchParams.sortDir === "asc" ? "asc" : "desc";
    const nextDir = currentSort === key && currentDir === "desc" ? "asc" : "desc";
    applyFilter({ sortBy: key, sortDir: nextDir, page: "1" });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      const res = await fetch(`/api/payments/export?${params.toString()}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `Payments_${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", description: "Could not generate the CSV. Please try again.", variant: "error" });
    } finally {
      setExporting(false);
    }
  }

  function openNew() {
    setEditingPayment(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(payment: any) {
    setEditingPayment(payment);
    setForm({
      date: new Date(payment.date).toISOString().split("T")[0],
      customerId: payment.customerId ?? "",
      amount: String(payment.amount),
      mode: payment.mode,
      referenceNo: payment.referenceNo ?? "",
      remarks: payment.remarks ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(editingPayment ? `/api/payments/${editingPayment.id}` : "/api/payments", {
        method: editingPayment ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: editingPayment ? "Payment updated" : "Payment recorded",
        description: editingPayment ? "Changes have been saved." : "The new payment has been recorded.",
        variant: "success",
      });
      setShowForm(false);
      setEditingPayment(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: editingPayment ? "Update failed" : "Could not record payment",
        description: err?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function openDelete(payment: any) {
    setDeletingPayment(payment);
  }

  async function confirmDelete() {
    if (!deletingPayment) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/payments/${deletingPayment.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Payment deleted", description: "The payment has been permanently removed.", variant: "success" });
      setDeletingPayment(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Please try again.", variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);
  const hasFilters = Boolean(searchParams.customerId || searchParams.from || searchParams.to);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>
            Payments
          </h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">{total} payments • {formatCurrency(totalAmount)} received</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60"
            style={{ color: "#1E3A5F" }}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
            style={{ background: "#1E3A5F" }}>
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Customer</label>
            <select value={searchParams.customerId ?? ""} onChange={e => applyFilter({ customerId: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-48 focus:outline-none">
              <option value="">All Customers</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input type="date" value={searchParams.from ?? ""} onChange={e => applyFilter({ from: e.target.value, page: "1" })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              <span className="text-gray-300">–</span>
              <input type="date" value={searchParams.to ?? ""} onChange={e => applyFilter({ to: e.target.value, page: "1" })}
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

      {/* New / Edit Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md shadow-xl md:p-6">
            <h2 className="text-lg font-bold mb-4 md:mb-5" style={{ color: "#1E3A5F" }}>
              {editingPayment ? "Edit Payment" : "Record Payment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Customer *</label>
                <select required value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option value="">Select customer...</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Amount (₹) *</label>
                  <input type="number" required min={1} step={0.01} placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Payment Mode *</label>
                  <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {MODES.map(m => <option key={m} value={m}>{getPaymentModeLabel(m)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Reference No. (UPI/NEFT/Cheque)</label>
                <input value={form.referenceNo} onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))}
                  placeholder="e.g. UPI-123456789"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Remarks</label>
                <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingPayment(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : editingPayment ? "Save Changes" : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation */}
      {deletingPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-[#E8E8E8] md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Delete Payment</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete this payment?
            </p>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3.5 mb-6 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-800">{deletingPayment.customer?.name ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deletingPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{formatDate(deletingPayment.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-medium text-gray-800">{getPaymentModeLabel(deletingPayment.mode)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletingPayment(null)} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                {deleteLoading ? "Deleting..." : "Delete Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[74vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: "#DCE9F7" }}>
              <tr>
                {SORT_COLUMNS.map(col => {
                  const isActive = (searchParams.sortBy ?? "date") === col.key;
                  const dir = searchParams.sortDir === "asc" ? "asc" : "desc";
                  const isAmount = col.key === "amount";
                  return (
                    <th key={col.key} onClick={() => toggleSort(col.key)}
                      className={`px-3 py-2.5 text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide cursor-pointer select-none border-b-2 ${isAmount ? "text-right" : "text-left"}`}
                      style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                      <span className={`inline-flex items-center gap-1 ${isAmount ? "justify-end" : ""}`}>
                        {col.label}
                        {isActive && (dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                      </span>
                    </th>
                  );
                })}
                <th className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Reference No.</th>
                <th className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Remarks</th>
                <th className="px-3 py-2.5 text-right text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap md:px-4 md:py-4">{formatDate(p.date)}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-800 md:px-4 md:py-4">{p.customer?.name ?? "Unknown"}</td>
                  <td className="px-3 py-2.5 text-sm font-bold text-right md:px-4 md:py-4" style={{ color: "#1E3A5F" }}>{formatCurrency(p.amount)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-700 md:px-4 md:py-4">{getPaymentModeLabel(p.mode)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 font-mono md:px-4 md:py-4">{p.referenceNo || "—"}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-400 md:px-4 md:py-4">{p.remarks || "No remarks"}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit payment"
                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        title="Delete payment"
                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => applyFilter({ page: String(p) })}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-150 ${p === page ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={p === page ? { background: "#1E3A5F" } : {}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
