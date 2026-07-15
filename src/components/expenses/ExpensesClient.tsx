"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronUp, ChevronDown, RotateCcw, Pencil, Trash2, AlertTriangle, Download, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, getExpenseCategoryLabel } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = ["FUEL", "SALARY", "RENT", "TRAIN_CHARGES", "AIR_CHARGES", "LOADING", "UNLOADING", "MISC"];
// Monochrome Yale Blue tint ramp for the category breakdown bars — no rainbow pills.
const PIE_COLORS = ["#1E3A5F", "#2C4C74", "#3D5F89", "#5578A3", "#7093BD", "#8FADD6", "#A9C4E3", "#C3D6EC"];

const SORT_COLUMNS: { key: string; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
];

interface Props {
  expenses: any[];
  total: number;
  totalAmount: number;
  byCategory: any[];
  offices: any[];
  role: string;
  page: number;
  pageSize: number;
  searchParams: any;
}

export function ExpensesClient({
  expenses, total, totalAmount, byCategory, offices, role, page, pageSize, searchParams,
}: Props) {
  const router = useRouter();
  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    category: "FUEL", amount: "", description: "", officeId: "", paidTo: "", billNumber: "", remarks: "",
  };
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  function applyFilter(params: Record<string, string>) {
    const p = new URLSearchParams({ ...searchParams, ...params });
    router.push(`/dashboard/expenses?${p.toString()}`);
  }

  function resetFilters() {
    router.push("/dashboard/expenses");
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
      // Same category/office/date/sort params currently applied to the table —
      // "page" is intentionally dropped since export always covers every
      // matching record, not just the page you happen to be viewing.
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      const res = await fetch(`/api/expenses/export?${params.toString()}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
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
    setEditingExpense(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(expense: any) {
    setEditingExpense(expense);
    setForm({
      date: new Date(expense.date).toISOString().split("T")[0],
      category: expense.category,
      amount: String(expense.amount),
      description: expense.description ?? "",
      officeId: expense.officeId ?? "",
      paidTo: expense.paidTo ?? "",
      billNumber: expense.billNumber ?? "",
      remarks: expense.remarks ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses", {
        method: editingExpense ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: editingExpense ? "Expense updated" : "Expense added",
        description: editingExpense ? "Changes have been saved." : "The new expense has been recorded.",
        variant: "success",
      });
      setShowForm(false);
      setEditingExpense(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: editingExpense ? "Update failed" : "Could not add expense",
        description: err?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function openDelete(expense: any) {
    setDeletingExpense(expense);
  }

  async function confirmDelete() {
    if (!deletingExpense) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Expense deleted", description: "The expense has been permanently removed.", variant: "success" });
      setDeletingExpense(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Please try again.", variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);
  const hasFilters = Boolean(searchParams.category || searchParams.officeId || searchParams.from || searchParams.to);

  const totalCategoryAmount = byCategory.reduce((s: number, c: any) => s + (c._sum.amount ?? 0), 0);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>
            Expenses
          </h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">{total} entries · {formatCurrency(totalAmount)} total</p>
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
            <Plus className="w-4 h-4" /> New Expense
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Category</label>
            <select value={searchParams.category ?? ""} onChange={e => applyFilter({ category: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{getExpenseCategoryLabel(c)}</option>)}
            </select>
          </div>
          {role === "SUPER_ADMIN" && (
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Office</label>
              <select value={searchParams.officeId ?? ""} onChange={e => applyFilter({ officeId: e.target.value, page: "1" })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                <option value="">All Offices</option>
                {offices.map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
              </select>
            </div>
          )}
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

      {/* Compact Expense Breakdown by Category — quick glance, not a dashboard chart */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 shrink-0">
              By Category
            </span>
            {byCategory
              .slice()
              .sort((a: any, b: any) => (b._sum.amount ?? 0) - (a._sum.amount ?? 0))
              .map((c: any, i: number) => {
                const pct = totalCategoryAmount > 0 ? ((c._sum.amount ?? 0) / totalCategoryAmount) * 100 : 0;
                return (
                  <div key={c.category} className="flex items-center gap-1.5 text-sm">
                    <span className="size-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-700">{getExpenseCategoryLabel(c.category)}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(c._sum.amount ?? 0)}</span>
                    <span className="text-gray-400">({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* New / Edit Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md shadow-xl md:p-6">
            <h2 className="text-lg font-bold mb-4 md:mb-5" style={{ color: "#1E3A5F" }}>
              {editingExpense ? "Edit Expense" : "New Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{getExpenseCategoryLabel(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Amount (₹) *</label>
                  <input type="number" required min={1} step={0.01} placeholder="0" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                {role === "SUPER_ADMIN" && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Office</label>
                    <select value={form.officeId} onChange={e => setForm(f => ({ ...f, officeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                      <option value="">Select office</option>
                      {offices.map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Paid To</label>
                  <input value={form.paidTo} onChange={e => setForm(f => ({ ...f, paidTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Name or vendor" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Bill Number</label>
                  <input value={form.billNumber} onChange={e => setForm(f => ({ ...f, billNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : editingExpense ? "Save Changes" : "New Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation */}
      {deletingExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-[#E8E8E8] md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Delete Expense</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this expense?
            </p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3.5 mb-6 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-800">{getExpenseCategoryLabel(deletingExpense.category)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deletingExpense.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Office</span>
                <span className="font-medium text-gray-800">{deletingExpense.office?.city || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{formatDate(deletingExpense.date)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletingExpense(null)} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                {deleteLoading ? "Deleting..." : "Delete Expense"}
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
                  return (
                    <th key={col.key} onClick={() => toggleSort(col.key)}
                      className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide cursor-pointer select-none border-b-2"
                      style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {isActive && (dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                      </span>
                    </th>
                  );
                })}
                <th className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Description</th>
                <th onClick={() => toggleSort("office")}
                  className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide cursor-pointer select-none border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                  <span className="inline-flex items-center gap-1">
                    Office
                    {(searchParams.sortBy ?? "date") === "office" && (
                      (searchParams.sortDir === "asc" ? "asc" : "desc") === "asc"
                        ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                    )}
                  </span>
                </th>
                <th className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Paid To</th>
                <th className="px-3 py-2.5 text-left text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Bill #</th>
                <th className="px-3 py-2.5 text-right text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide border-b-2"
                  style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap md:px-4 md:py-4">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-700 md:px-4 md:py-4">{getExpenseCategoryLabel(e.category)}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-gray-900 md:px-4 md:py-4">{formatCurrency(e.amount)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 md:px-4 md:py-4">{e.description || "No description"}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 md:px-4 md:py-4">{e.office?.city || "N/A"}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 md:px-4 md:py-4">{e.paidTo || "N/A"}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-500 font-mono md:px-4 md:py-4">{e.billNumber || "N/A"}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(e)}
                        title="Edit expense"
                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(e)}
                        title="Delete expense"
                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No expenses found</td></tr>
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
