"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  customers: any[];
  offices: any[];
  userOfficeId: string | null;
  role: string;
}

export function NewShipmentForm({ customers, offices, userOfficeId, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    customerId: "",
    officeId: userOfficeId ?? "",
    mode: "ROAD",
    packets: "",
    weight: "",
    rate: "",
    fromCity: "",
    toCity: "",
    description: "",
    remarks: "",
  });

  const weightNum = parseFloat(form.weight) || 0;
  const rateNum = parseFloat(form.rate) || 0;
  const amount = weightNum * rateNum;

  function handleCustomerChange(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) { setForm((f) => ({ ...f, customerId: id })); return; }
    const rateMap: Record<string, number> = {
      ROAD: customer.defaultRateRoad,
      TRAIN: customer.defaultRateTrain,
      AIR: customer.defaultRateAir,
    };
    setForm((f) => ({ ...f, customerId: id, rate: String(rateMap[f.mode] ?? 0) }));
  }

  function handleModeChange(mode: string) {
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer) { setForm((f) => ({ ...f, mode })); return; }
    const rateMap: Record<string, number> = {
      ROAD: customer.defaultRateRoad,
      TRAIN: customer.defaultRateTrain,
      AIR: customer.defaultRateAir,
    };
    setForm((f) => ({ ...f, mode, rate: String(rateMap[mode] ?? 0) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        packets: parseInt(form.packets) || 1,
        weight: weightNum,
        rate: rateNum,
        amount,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/shipments/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error || "Failed to create shipment");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/shipments" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>New Shipment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create a new shipment booking</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4 md:p-6 md:space-y-5">
        <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Transport Mode *</label>
            <select
              required
              value={form.mode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ROAD">🚛 Road</option>
              <option value="TRAIN">🚂 Train</option>
              <option value="AIR">✈️ Air</option>
            </select>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
            <select
              required
              value={form.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
              ))}
            </select>
          </div>

          {/* Office */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Office *</label>
            <select
              required
              value={form.officeId}
              onChange={(e) => setForm((f) => ({ ...f, officeId: e.target.value }))}
              disabled={role !== "SUPER_ADMIN"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">Select office...</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.city} — {o.name}</option>
              ))}
            </select>
          </div>

          {/* From City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From City *</label>
            <input
              required
              value={form.fromCity}
              onChange={(e) => setForm((f) => ({ ...f, fromCity: e.target.value }))}
              placeholder="e.g. Jaipur"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To City *</label>
            <input
              required
              value={form.toCity}
              onChange={(e) => setForm((f) => ({ ...f, toCity: e.target.value }))}
              placeholder="e.g. Delhi"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Packets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Packets (PCS) *</label>
            <input
              type="number"
              required
              min={1}
              placeholder="1"
              value={form.packets}
              onChange={(e) => setForm((f) => ({ ...f, packets: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg) *</label>
            <input
              type="number"
              required
              min={0}
              step={0.01}
              placeholder="0"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate (₹/kg) *</label>
            <input
              type="number"
              required
              min={0}
              step={0.01}
              placeholder="0"
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount (computed) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
            <div className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-sm bg-gray-50 font-bold" style={{ color: "#1e3a5f" }}>
              ₹ {amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contents / Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Garments, Electronics..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
          <textarea
            rows={2}
            value={form.remarks}
            onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            placeholder="Any special instructions..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Summary box */}
        <div className="rounded-lg p-4 border" style={{ background: "#f0f4f8", borderColor: "#c5d1e8" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500">Packets</div>
              <div className="font-bold text-gray-800">{form.packets} PCS</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Weight</div>
              <div className="font-bold text-gray-800">{form.weight} kg</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rate</div>
              <div className="font-bold text-gray-800">₹{form.rate}/kg</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Amount</div>
              <div className="font-bold text-lg" style={{ color: "#1e3a5f" }}>₹{amount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/shipments"
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "#1e3a5f" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Creating..." : "Create Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
}
