"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Props {
  shipments: any[];
  total: number;
  page: number;
  pageSize: number;
  offices: any[];
  role: string;
  searchParams: any;
  modeBreakdown: any[];
}

const BADGE_CLASS = "inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-white border border-gray-300 text-gray-700";

function formatMode(mode: string): string {
  switch (mode) {
    case "ROAD": return "Road";
    case "TRAIN": return "Train";
    case "AIR": return "Air";
    default: return mode;
  }
}

export function ShipmentsClient({ shipments, total, page, pageSize, offices, role, searchParams, modeBreakdown }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [editingShipment, setEditingShipment] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deletingShipment, setDeletingShipment] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(s: any) {
    setEditingShipment(s);
    setEditForm({
      date: new Date(s.date).toISOString().split("T")[0],
      mode: s.mode,
      packets: s.packets,
      weight: s.weight,
      rate: s.rate,
      amount: s.amount,
      fromCity: s.fromCity,
      toCity: s.toCity,
      description: s.description ?? "",
      remarks: s.remarks ?? "",
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingShipment) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Shipment updated", description: "Changes have been saved.", variant: "success" });
      setEditingShipment(null);
      router.refresh();
    } catch {
      toast({ title: "Update failed", description: "Could not save changes. Please try again.", variant: "error" });
    } finally {
      setEditLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deletingShipment) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/shipments/${deletingShipment.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Shipment deleted", description: "The shipment has been permanently removed.", variant: "success" });
      setDeletingShipment(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Please try again.", variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  }

  function applyFilter(params: Record<string, string>) {
    const p = new URLSearchParams({ ...searchParams, ...params });
    router.push(`/dashboard/shipments?${p.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter({ search, page: "1" });
  }

  function resetFilters() {
    setSearch("");
    router.push("/dashboard/shipments");
  }

  const totalPages = Math.ceil(total / pageSize);
  const hasFilters = Boolean(searchParams.search || searchParams.mode || searchParams.status || searchParams.office);

  const roadCount = modeBreakdown.find((m) => m.mode === "ROAD")?._count ?? 0;
  const trainCount = modeBreakdown.find((m) => m.mode === "TRAIN")?._count ?? 0;
  const totalRevenue = modeBreakdown.reduce((s, m) => s + (m._sum.amount ?? 0), 0);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>Shipments</h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">Manage and track all shipments across offices.</p>
        </div>
        <Link
          href="/dashboard/shipments/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
          style={{ background: "#1E3A5F" }}
        >
          <Plus className="w-4 h-4" /> New Shipment
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-64">
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tracking #, customer, city..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </form>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Mode</label>
            <select
              value={searchParams.mode ?? ""}
              onChange={(e) => applyFilter({ mode: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All Modes</option>
              <option value="ROAD">Road</option>
              <option value="TRAIN">Train</option>
              <option value="AIR">Air</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Status</label>
            <select
              value={searchParams.status ?? ""}
              onChange={(e) => applyFilter({ status: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              {["BOOKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          {role === "SUPER_ADMIN" && (
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-1">Office</label>
              <select
                value={searchParams.office ?? ""}
                onChange={(e) => applyFilter({ office: e.target.value, page: "1" })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              >
                <option value="">All Offices</option>
                {offices.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.city}</option>
                ))}
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

      {/* Edit Shipment Modal */}
      {editingShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto md:p-6">
            <h2 className="text-lg font-bold mb-4 md:mb-5" style={{ color: "#1E3A5F" }}>Edit Shipment</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Date *</label>
                  <input type="date" required value={editForm.date}
                    onChange={e => setEditForm((f: any) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Mode *</label>
                  <select required value={editForm.mode}
                    onChange={e => setEditForm((f: any) => ({ ...f, mode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    <option value="ROAD">Road</option>
                    <option value="TRAIN">Train</option>
                    <option value="AIR">Air</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">From City *</label>
                  <input required value={editForm.fromCity}
                    onChange={e => setEditForm((f: any) => ({ ...f, fromCity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">To City *</label>
                  <input required value={editForm.toCity}
                    onChange={e => setEditForm((f: any) => ({ ...f, toCity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Packets *</label>
                  <input type="number" required min={1} value={editForm.packets}
                    onChange={e => setEditForm((f: any) => ({ ...f, packets: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Weight (kg) *</label>
                  <input type="number" required min={0} step={0.01} value={editForm.weight}
                    onChange={e => setEditForm((f: any) => ({ ...f, weight: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Rate (₹/kg) *</label>
                  <input type="number" required min={0} step={0.01} value={editForm.rate}
                    onChange={e => setEditForm((f: any) => ({ ...f, rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Amount (₹) *</label>
                <input type="number" required min={0} step={0.01} value={editForm.amount}
                  onChange={e => setEditForm((f: any) => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Contents / Description</label>
                <input value={editForm.description}
                  onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Remarks</label>
                <input value={editForm.remarks}
                  onChange={e => setEditForm((f: any) => ({ ...f, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingShipment(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Shipment Confirmation */}
      {deletingShipment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-[#E8E8E8] md:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Delete Shipment</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete this shipment?
            </p>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3.5 mb-6 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tracking #</span>
                <span className="font-medium text-gray-800 font-mono">{deletingShipment.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-800">{deletingShipment.customer?.name ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deletingShipment.amount)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletingShipment(null)} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                {deleteLoading ? "Deleting..." : "Delete Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Summary Strip */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 px-1">
        <span>Total Shipments <strong className="text-gray-900">{total}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Road <strong className="text-gray-900">{roadCount}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Train <strong className="text-gray-900">{trainCount}</strong></span>
        <span className="text-gray-300">•</span>
        <span>Total Revenue <strong className="text-gray-900">{formatCurrency(totalRevenue)}</strong></span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#DCE9F7" }}>
              <tr>
                {["Date", "Tracking #", "Customer", "Mode", "Route", "Pkts", "Weight", "Rate", "Amount", "Status", "Actions"].map((h, i) => (
                  <th key={h}
                    className={`px-3 py-2.5 text-xs md:px-4 md:py-4 md:text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 ${i >= 5 && i <= 8 ? "text-right" : "text-left"}`}
                    style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((s) => (
                <tr key={s.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap md:px-4 md:py-4">{formatDate(s.date)}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <Link
                      href={`/dashboard/shipments/${s.id}`}
                      className="font-mono text-xs font-medium hover:underline"
                      style={{ color: "#1E3A5F" }}
                    >
                      {s.trackingNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-900 md:px-4 md:py-4">{s.customer?.name}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <span className={`${BADGE_CLASS} whitespace-nowrap`}>
                      {formatMode(s.mode)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap md:px-4 md:py-4">{s.fromCity} → {s.toCity}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-700 md:px-4 md:py-4">{s.packets}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-700 whitespace-nowrap md:px-4 md:py-4">{s.weight} kg</td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-700 whitespace-nowrap md:px-4 md:py-4">₹{s.rate}/kg</td>
                  <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-900 md:px-4 md:py-4">{formatCurrency(s.amount)}</td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <span className={`${BADGE_CLASS} whitespace-nowrap`}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 md:px-4 md:py-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/shipments/${s.id}`}
                        title="View shipment"
                        className="inline-flex items-center gap-1.5 p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => openEdit(s)}
                        title="Edit shipment"
                        className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      {role === "SUPER_ADMIN" && (
                        <button
                          onClick={() => setDeletingShipment(s)}
                          title="Delete shipment"
                          className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                    No shipments found.{" "}
                    <Link href="/dashboard/shipments/new" className="text-blue-600 hover:underline">
                      Create one →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => applyFilter({ page: String(p) })}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    p === page
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={p === page ? { background: "#1E3A5F" } : {}}
                >
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
