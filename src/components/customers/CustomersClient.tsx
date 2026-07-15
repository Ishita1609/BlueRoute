"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Phone, MapPin, Package, Pencil, Trash2, Power, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  customers: any[];
  total: number;
  page: number;
  pageSize: number;
  searchParams: any;
}

export function CustomersClient({ customers, total, page, pageSize, searchParams }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", gstNumber: "",
    defaultRateRoad: "", defaultRateTrain: "", defaultRateAir: "", creditLimit: "",
  });
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/customers?search=${search}`);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  function openEdit(c: any) {
    setEditingCustomer(c);
    setEditForm({
      name: c.name, phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "",
      city: c.city ?? "", gstNumber: c.gstNumber ?? "",
      defaultRateRoad: String(c.defaultRateRoad), defaultRateTrain: String(c.defaultRateTrain),
      defaultRateAir: String(c.defaultRateAir), creditLimit: String(c.creditLimit),
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCustomer) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Customer updated", description: "Changes have been saved.", variant: "success" });
      setEditingCustomer(null);
      router.refresh();
    } catch {
      toast({ title: "Update failed", description: "Could not save changes. Please try again.", variant: "error" });
    } finally {
      setEditLoading(false);
    }
  }

  async function toggleActive(c: any) {
    setTogglingId(c.id);
    try {
      const res = await fetch(`/api/customers/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: c.isActive ? "Customer deactivated" : "Customer activated",
        description: c.isActive ? "This customer is now hidden from active operations." : "This customer is active again.",
        variant: "success",
      });
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Please try again.", variant: "error" });
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    if (!deletingCustomer) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Customer deleted", description: "The customer has been permanently removed.", variant: "success" });
      setDeletingCustomer(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Delete blocked", description: err?.message || "Please try again.", variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold md:text-2xl" style={{ color: "#1e3a5f" }}>Customers</h1>
          <p className="text-gray-500 text-xs mt-0.5 md:text-sm">{total} total customers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, city..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
          Search
        </button>
      </form>

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4 md:mb-5" style={{ color: "#1e3a5f" }}>Add New Customer</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Customer / Business name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Jaipur" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">GST Number</label>
                  <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Road Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={form.defaultRateRoad}
                    onChange={e => setForm(f => ({ ...f, defaultRateRoad: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Train Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={form.defaultRateTrain}
                    onChange={e => setForm(f => ({ ...f, defaultRateTrain: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Air Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={form.defaultRateAir}
                    onChange={e => setForm(f => ({ ...f, defaultRateAir: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Credit Limit (₹)</label>
                  <input type="number" placeholder="0" value={form.creditLimit}
                    onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}>
                  {loading ? "Saving..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 md:mb-5" style={{ color: "#1e3a5f" }}>Edit Customer</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Name *</label>
                  <input required value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Customer / Business name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">City</label>
                  <input value={editForm.city} onChange={e => setEditForm((f: any) => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" placeholder="Jaipur" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">GST Number</label>
                  <input value={editForm.gstNumber} onChange={e => setEditForm((f: any) => ({ ...f, gstNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Road Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={editForm.defaultRateRoad}
                    onChange={e => setEditForm((f: any) => ({ ...f, defaultRateRoad: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Train Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={editForm.defaultRateTrain}
                    onChange={e => setEditForm((f: any) => ({ ...f, defaultRateTrain: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Air Rate (₹/kg)</label>
                  <input type="number" step="0.01" placeholder="0" value={editForm.defaultRateAir}
                    onChange={e => setEditForm((f: any) => ({ ...f, defaultRateAir: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Credit Limit (₹)</label>
                  <input type="number" placeholder="0" value={editForm.creditLimit}
                    onChange={e => setEditForm((f: any) => ({ ...f, creditLimit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingCustomer(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation */}
      {deletingCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Delete Customer</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete <strong>{deletingCustomer.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletingCustomer(null)} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 disabled:opacity-60">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                {deleteLoading ? "Deleting..." : "Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 hover:shadow-md transition-shadow"
          >
            <Link href={`/dashboard/customers/${c.id}`} className="block">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: "#1e3a5f" }}
                >
                  {c.name[0].toUpperCase()}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">{c.name}</h3>
              {c.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {c.phone}
                </p>
              )}
              {c.city && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {c.city}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-400">Road</div>
                  <div className="font-medium text-xs">₹{c.defaultRateRoad}/kg</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Train</div>
                  <div className="font-medium text-xs">₹{c.defaultRateTrain}/kg</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Air</div>
                  <div className="font-medium text-xs">₹{c.defaultRateAir}/kg</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Package className="w-3 h-3" /> {c._count?.shipments ?? 0} shipments
              </div>
            </Link>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
              <button
                onClick={() => openEdit(c)}
                title="Edit customer"
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => toggleActive(c)}
                disabled={togglingId === c.id}
                title={c.isActive ? "Deactivate customer" : "Activate customer"}
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-60"
              >
                <Power className="size-3.5" />
              </button>
              <button
                onClick={() => setDeletingCustomer(c)}
                title="Delete customer"
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 transition-colors duration-150 hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No customers found. <button onClick={() => setShowForm(true)} className="text-blue-600 hover:underline">Add one →</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/customers?page=${p}&search=${searchParams.search ?? ""}`}
              className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center ${
                p === page ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={p === page ? { background: "#1e3a5f" } : {}}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
