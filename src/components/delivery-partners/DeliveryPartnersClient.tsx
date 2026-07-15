"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Truck, Phone, MapPin } from "lucide-react";

interface Props { partners: any[] }

export function DeliveryPartnersClient({ partners }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicleNo: "", area: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/delivery-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
            <Truck className="w-6 h-6" /> Delivery Partners
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{partners.length} active partners</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "#1e3a5f" }}>
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: "#1e3a5f" }}>
                <Truck className="w-6 h-6" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {p.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800">{p.name}</h3>
            {p.vehicleNo && <p className="text-sm text-gray-500 mt-1 font-mono">{p.vehicleNo}</p>}
            {p.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> {p.phone}
              </p>
            )}
            {p.area && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {p.area}
              </p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              {p._count?.shipments ?? 0} shipments handled
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-5" style={{ color: "#1e3a5f" }}>Add Delivery Partner</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Name *", key: "name", placeholder: "Full name", required: true },
                { label: "Phone", key: "phone", placeholder: "9876543210" },
                { label: "Vehicle No.", key: "vehicleNo", placeholder: "RJ-14-AB-1234" },
                { label: "Area / Zone", key: "area", placeholder: "Jaipur City" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
                  <input
                    required={field.required}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#1e3a5f" }}>
                  {loading ? "Saving..." : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
