"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Plus, Building2, Pencil, Power, Trash2, AlertTriangle, Loader2,
  Key, Search, Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatLastLogin } from "@/lib/utils";

interface Props {
  offices: any[];
  users: any[];
}

const emptyOfficeForm = { name: "", city: "", address: "", phone: "", email: "" };
const emptyUserForm = { name: "", email: "", password: "", role: "OFFICE_MANAGER", officeId: "", isActive: true };
const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: "Super Admin", OFFICE_MANAGER: "Office Manager" };

function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
  };
}
function isPasswordValid(pw: string) {
  const c = passwordChecks(pw);
  return c.length && c.upper && c.lower && c.number;
}

function PasswordPolicyHint({ password }: { password: string }) {
  const c = passwordChecks(password);
  const items = [
    { key: "length", label: "Minimum 8 characters", met: c.length },
    { key: "upper", label: "1 uppercase letter", met: c.upper },
    { key: "lower", label: "1 lowercase letter", met: c.lower },
    { key: "number", label: "1 number", met: c.number },
  ];
  return (
    <ul className="mt-2 space-y-1">
      {items.map(i => (
        <li key={i.key} className={`text-xs flex items-center gap-1.5 transition-colors duration-150 ${i.met ? "text-green-700" : "text-gray-400"}`}>
          <Check className={`w-3 h-3 ${i.met ? "opacity-100" : "opacity-30"}`} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function SettingsClient({ offices, users }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"offices" | "users">("offices");
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionOfficeId, setActionOfficeId] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [officeForm, setOfficeForm] = useState(emptyOfficeForm);
  const [userForm, setUserForm] = useState(emptyUserForm);

  const [editingOffice, setEditingOffice] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(emptyOfficeForm);
  const [deletingOffice, setDeletingOffice] = useState<any | null>(null);
  const [deleteBlockers, setDeleteBlockers] = useState<{ label: string; count: number }[] | null>(null);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: "", email: "", officeId: "", role: "OFFICE_MANAGER", isActive: true });
  const [resettingUser, setResettingUser] = useState<any | null>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [deleteUserBlockers, setDeleteUserBlockers] = useState<{ label: string; count: number }[] | null>(null);

  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SUPER_ADMIN" | "OFFICE_MANAGER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter(u => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.isActive : !u.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, roleFilter, statusFilter]);

  async function createOffice(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(officeForm),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Office added", description: `${officeForm.name} has been created.`, variant: "success" });
      setShowOfficeForm(false);
      setOfficeForm(emptyOfficeForm);
      router.refresh();
    } catch {
      toast({ title: "Could not add office", description: "Please check the details and try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordValid(userForm.password)) {
      toast({ title: "Weak password", description: "Password does not meet the required policy.", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "User added", description: `${userForm.name} has been created.`, variant: "success" });
      setShowUserForm(false);
      setUserForm(emptyUserForm);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Could not add user", description: err?.message || "Please check the details and try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openEdit(o: any) {
    setEditForm({
      name: o.name ?? "",
      city: o.city ?? "",
      address: o.address ?? "",
      phone: o.phone ?? "",
      email: o.email ?? "",
    });
    setEditingOffice(o);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOffice) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/offices/${editingOffice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Office updated", description: `${editForm.name} has been updated.`, variant: "success" });
      setEditingOffice(null);
      router.refresh();
    } catch {
      toast({ title: "Update failed", description: "Could not update the office. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(o: any) {
    setActionOfficeId(o.id);
    try {
      const res = await fetch(`/api/offices/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !o.isActive }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: o.isActive ? "Office deactivated" : "Office activated",
        description: `${o.name} is now ${o.isActive ? "hidden from the website and new operations" : "active"}.`,
        variant: "success",
      });
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Could not update office status.", variant: "error" });
    } finally {
      setActionOfficeId(null);
    }
  }

  function openDelete(o: any) {
    setDeleteBlockers(null);
    setDeletingOffice(o);
  }

  async function confirmDelete() {
    if (!deletingOffice) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/offices/${deletingOffice.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.status === 409) {
        setDeleteBlockers(data.blockers);
        return;
      }
      if (!res.ok) throw new Error();
      toast({ title: "Office deleted", description: `${deletingOffice.name} has been permanently removed.`, variant: "success" });
      setDeletingOffice(null);
      router.refresh();
    } catch {
      toast({ title: "Delete failed", description: "Could not delete the office. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openEditUser(u: any) {
    setEditUserForm({
      name: u.name ?? "",
      email: u.email ?? "",
      officeId: u.officeId ?? "",
      role: u.role,
      isActive: u.isActive,
    });
    setEditingUser(u);
  }

  async function saveEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "User updated", description: `${editUserForm.name} has been updated.`, variant: "success" });
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Could not update the user.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openResetPassword(u: any) {
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setResettingUser(u);
  }

  async function submitResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resettingUser) return;
    if (!isPasswordValid(passwordForm.newPassword)) {
      toast({ title: "Weak password", description: "Password does not meet the required policy.", variant: "error" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${resettingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Password reset", description: `Password updated for ${resettingUser.name}.`, variant: "success" });
      setResettingUser(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Reset failed", description: err?.message || "Could not reset the password.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserActive(u: any) {
    setActionUserId(u.id);
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: u.isActive ? "User deactivated" : "User activated",
        description: `${u.name} ${u.isActive ? "can no longer log in." : "can now log in again."}`,
        variant: "success",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Action failed", description: err?.message || "Could not update user status.", variant: "error" });
    } finally {
      setActionUserId(null);
    }
  }

  function openDeleteUser(u: any) {
    setDeleteUserBlockers(null);
    setDeletingUser(u);
  }

  async function confirmDeleteUser() {
    if (!deletingUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.status === 409) {
        setDeleteUserBlockers(data.blockers);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      toast({ title: "User deleted", description: `${deletingUser.name} has been permanently removed.`, variant: "success" });
      setDeletingUser(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Could not delete the user.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2.5 md:text-[32px]" style={{ color: "#1E3A5F" }}>
          <Settings className="w-6 h-6 md:w-7 md:h-7" /> Settings
        </h1>
        <p className="text-gray-500 text-xs mt-1 md:text-sm">Manage offices and user accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["offices", "users"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-colors duration-150 ${
              tab === t
                ? "text-white border-transparent"
                : "bg-white text-gray-500 border-[#E8E8E8] hover:text-gray-700"
            }`}
            style={tab === t ? { background: "#1E3A5F" } : undefined}>
            {t}
          </button>
        ))}
      </div>

      {/* Offices */}
      {tab === "offices" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowOfficeForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
              style={{ background: "#1E3A5F" }}>
              <Plus className="w-4 h-4" /> Add Office
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 md:gap-5">
            {offices.map(o => (
              <div key={o.id}
                className="group bg-white rounded-xl border border-[#E8E8E8] p-4 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-transform duration-150 hover:-translate-y-0.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: "#1E3A5F" }}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{o.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{o.city}</p>
                    <div className="mt-2 space-y-0.5">
                      {o.address && <p className="text-xs text-gray-400">{o.address}</p>}
                      {o.phone && <p className="text-xs text-gray-400">{o.phone}</p>}
                      {o.email && <p className="text-xs text-gray-400">{o.email}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      o.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {o.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(o)}
                        title="Edit office"
                        className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-50 hover:text-[#1E3A5F]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(o)}
                        title={o.isActive ? "Deactivate office" : "Activate office"}
                        disabled={actionOfficeId === o.id}
                        className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-50 hover:text-amber-600 disabled:opacity-50"
                      >
                        {actionOfficeId === o.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Power className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openDelete(o)}
                        title="Delete office"
                        className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-50 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {offices.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2">No offices yet. Add your first office to get started.</p>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full h-9 pl-9 pr-3 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300"
                />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
                className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm text-gray-600 focus:outline-none focus:border-gray-300">
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="OFFICE_MANAGER">Office Manager</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 border border-[#E8E8E8] rounded-lg text-sm text-gray-600 focus:outline-none focus:border-gray-300">
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button onClick={() => setShowUserForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0 transition-opacity duration-150 hover:opacity-90"
              style={{ background: "#1E3A5F" }}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/60 border-b border-[#E8E8E8]">
                <tr>
                  {["Name", "Email", "Role", "Office", "Status", "Last Login"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide md:px-4 md:py-3.5">{h}</th>
                  ))}
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide md:px-4 md:py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredUsers.map(u => {
                  const isSuperAdmin = u.role === "SUPER_ADMIN";
                  return (
                    <tr key={u.id} className="group hover:bg-gray-50/70 transition-colors duration-150">
                      <td className="px-3 py-2.5 font-semibold text-gray-800 md:px-4 md:py-4">{u.name}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs md:px-4 md:py-4">{u.email}</td>
                      <td className="px-3 py-2.5 md:px-4 md:py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSuperAdmin ? "text-white" : "bg-gray-100 text-gray-600"
                        }`} style={isSuperAdmin ? { background: "#1E3A5F" } : undefined}>
                          {ROLE_LABELS[u.role] ?? u.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 text-sm md:px-4 md:py-4">{u.office?.city ?? "—"}</td>
                      <td className="px-3 py-2.5 md:px-4 md:py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          u.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs md:px-4 md:py-4">{formatLastLogin(u.lastLogin)}</td>
                      <td className="px-3 py-2.5 md:px-4 md:py-4">
                        <div className="flex items-center justify-end gap-0.5 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => openEditUser(u)}
                            title="Edit user"
                            className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-[#1E3A5F]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openResetPassword(u)}
                            title="Reset password"
                            className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-[#1E3A5F]"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleUserActive(u)}
                            title={isSuperAdmin ? "Super Admin cannot be deactivated" : u.isActive ? "Deactivate user" : "Activate user"}
                            disabled={actionUserId === u.id || isSuperAdmin}
                            className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-amber-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          >
                            {actionUserId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteUser(u)}
                            title={isSuperAdmin ? "Super Admin cannot be deleted" : "Delete user"}
                            disabled={isSuperAdmin}
                            className="p-1.5 rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No users match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Office Modal */}
      {showOfficeForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <h2 className="text-xl font-bold mb-4 md:mb-6" style={{ color: "#1E3A5F" }}>Add Office</h2>
            <form onSubmit={createOffice} className="space-y-4 md:space-y-5">
              {[
                { label: "Office Name *", key: "name", required: true, placeholder: "BlueRoute Logistics Mumbai" },
                { label: "City *", key: "city", required: true, placeholder: "Mumbai" },
                { label: "Address", key: "address", placeholder: "Full address" },
                { label: "Phone", key: "phone", placeholder: "022-12345678" },
                { label: "Email", key: "email", placeholder: "mumbai@blueroute.in" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">{f.label}</label>
                  <input required={f.required} value={(officeForm as any)[f.key]}
                    onChange={e => setOfficeForm(x => ({ ...x, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowOfficeForm(false); setOfficeForm(emptyOfficeForm); }}
                  className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : "Add Office"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Office Modal */}
      {editingOffice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <h2 className="text-xl font-bold mb-4 md:mb-6" style={{ color: "#1E3A5F" }}>Edit Office</h2>
            <form onSubmit={saveEdit} className="space-y-4 md:space-y-5">
              {[
                { label: "Office Name *", key: "name", required: true, placeholder: "BlueRoute Logistics Mumbai" },
                { label: "City *", key: "city", required: true, placeholder: "Mumbai" },
                { label: "Address", key: "address", placeholder: "Full address" },
                { label: "Phone", key: "phone", placeholder: "022-12345678" },
                { label: "Email", key: "email", placeholder: "mumbai@blueroute.in" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">{f.label}</label>
                  <input required={f.required} value={(editForm as any)[f.key]}
                    onChange={e => setEditForm(x => ({ ...x, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingOffice(null)}
                  className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Office Confirmation */}
      {deletingOffice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            {deleteBlockers ? (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-800">Cannot Delete Office</h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>{deletingOffice.name}</strong> has related data and cannot be permanently deleted:
                </p>
                <ul className="space-y-1 mb-4">
                  {deleteBlockers.map(b => (
                    <li key={b.label} className="text-xs text-gray-500 flex justify-between border-b border-gray-50 py-1.5">
                      <span className="capitalize">{b.label}</span>
                      <span className="font-medium text-gray-700">{b.count}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3.5 text-xs text-amber-700 mb-5">
                  Deactivate the office instead — it will disappear from the website and new operations while its history stays intact.
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeletingOffice(null)}
                    className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Close</button>
                  <button
                    onClick={() => { setDeletingOffice(null); toggleActive(deletingOffice); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                    style={{ background: "#1E3A5F" }}>
                    Deactivate Instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-gray-800">Delete Office</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to permanently delete <strong>{deletingOffice.name}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setDeletingOffice(null)}
                    className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                  <button onClick={confirmDelete} disabled={loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                    {loading ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <h2 className="text-xl font-bold mb-4 md:mb-6" style={{ color: "#1E3A5F" }}>Add User</h2>
            <form onSubmit={createUser} className="space-y-4 md:space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Full Name *</label>
                <input required value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email *</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Password *</label>
                <input required type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
                <PasswordPolicyHint password={userForm.password} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Role *</label>
                  <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300">
                    <option value="OFFICE_MANAGER">Office Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Office</label>
                  <select value={userForm.officeId} onChange={e => setUserForm(f => ({ ...f, officeId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300">
                    <option value="">No office</option>
                    {offices.filter(o => o.isActive).map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={userForm.isActive}
                  onChange={e => setUserForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowUserForm(false); setUserForm(emptyUserForm); }}
                  className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading || !isPasswordValid(userForm.password)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <h2 className="text-xl font-bold mb-4 md:mb-6" style={{ color: "#1E3A5F" }}>Edit User</h2>
            {editingUser.role === "SUPER_ADMIN" && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3.5 text-xs text-gray-600 mb-5">
                This is a Super Admin account. Role and active status cannot be changed here.
              </div>
            )}
            <form onSubmit={saveEditUser} className="space-y-4 md:space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Full Name *</label>
                <input required value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email *</label>
                <input required type="email" value={editUserForm.email} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Role *</label>
                  <select value={editUserForm.role} disabled={editingUser.role === "SUPER_ADMIN"}
                    onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400">
                    <option value="OFFICE_MANAGER">Office Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Office</label>
                  <select value={editUserForm.officeId} onChange={e => setEditUserForm(f => ({ ...f, officeId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300">
                    <option value="">No office</option>
                    {offices.filter(o => o.isActive).map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
                  </select>
                </div>
              </div>
              <label className={`flex items-center gap-2 text-sm ${editingUser.role === "SUPER_ADMIN" ? "text-gray-300" : "text-gray-600"}`}>
                <input type="checkbox" checked={editUserForm.isActive} disabled={editingUser.role === "SUPER_ADMIN"}
                  onChange={e => setEditUserForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300" />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            <h2 className="text-xl font-bold mb-1.5" style={{ color: "#1E3A5F" }}>Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4 md:mb-6">Set a new password for {resettingUser.name}.</p>
            <form onSubmit={submitResetPassword} className="space-y-4 md:space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">New Password *</label>
                <input required type="password" value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
                <PasswordPolicyHint password={passwordForm.newPassword} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Confirm Password *</label>
                <input required type="password" value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-gray-300" />
                {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                  <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setResettingUser(null)}
                  className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  disabled={loading || !isPasswordValid(passwordForm.newPassword) || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#1E3A5F" }}>
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-8 w-full max-w-md shadow-xl border border-[#E8E8E8]">
            {deleteUserBlockers ? (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-800">Cannot Delete This User</h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  This user owns historical business records and cannot be deleted:
                </p>
                <ul className="space-y-1 mb-4">
                  {deleteUserBlockers.map(b => (
                    <li key={b.label} className="text-xs text-gray-500 flex justify-between border-b border-gray-50 py-1.5">
                      <span className="capitalize">{b.label}</span>
                      <span className="font-medium text-gray-700">{b.count}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3.5 text-xs text-amber-700 mb-5">
                  Deactivate the account instead.
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeletingUser(null)}
                    className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Close</button>
                  <button
                    onClick={() => { setDeletingUser(null); toggleUserActive(deletingUser); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                    style={{ background: "#1E3A5F" }}>
                    Deactivate Instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-gray-800">Delete User</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to permanently delete <strong>{deletingUser.name}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setDeletingUser(null)}
                    className="flex-1 py-2.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50">Cancel</button>
                  <button onClick={confirmDeleteUser} disabled={loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 transition-opacity duration-150 hover:opacity-90 disabled:opacity-60">
                    {loading ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
