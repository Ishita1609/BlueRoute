"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, Clock, CheckCircle2,
  Truck, User, Phone, Printer, Edit2, Save, Loader2
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getModeIcon } from "@/lib/utils";

const STATUSES = ["BOOKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

export function ShipmentDetailClient({ shipment, deliveryPartners }: { shipment: any; deliveryPartners: any[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(shipment.status);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(shipment.deliveryPartnerId ?? "");

  async function updateStatus() {
    setUpdating(true);
    await fetch(`/api/shipments/${shipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        deliveryPartnerId: selectedPartner || null,
        location,
        description: note,
      }),
    });
    router.refresh();
    setUpdating(false);
    setNote("");
    setLocation("");
  }

  const statusSteps = ["BOOKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStep = statusSteps.indexOf(shipment.status);

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shipments" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
              {shipment.trackingNumber}
            </h1>
            <p className="text-gray-500 text-sm">{formatDate(shipment.date)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
            {shipment.status.replace(/_/g, " ")}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 no-print"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipment Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 md:mb-4">
              <Package className="w-5 h-5" style={{ color: "#1e3a5f" }} />
              Shipment Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-0.5">Transport Mode</div>
                <div className="font-medium flex items-center gap-1">
                  {getModeIcon(shipment.mode)} {shipment.mode}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Office</div>
                <div className="font-medium">{shipment.office?.name}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Route</div>
                <div className="font-medium">{shipment.fromCity} → {shipment.toCity}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Packets</div>
                <div className="font-medium">{shipment.packets} PCS</div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Weight</div>
                <div className="font-medium">{shipment.weight} kg</div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Rate</div>
                <div className="font-medium">₹{shipment.rate}/kg</div>
              </div>
              <div>
                <div className="text-gray-500 mb-0.5">Total Amount</div>
                <div className="font-bold text-lg" style={{ color: "#1e3a5f" }}>{formatCurrency(shipment.amount)}</div>
              </div>
              {shipment.description && (
                <div>
                  <div className="text-gray-500 mb-0.5">Contents</div>
                  <div className="font-medium">{shipment.description}</div>
                </div>
              )}
              {shipment.remarks && (
                <div className="sm:col-span-2">
                  <div className="text-gray-500 mb-0.5">Remarks</div>
                  <div className="font-medium">{shipment.remarks}</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
            <h2 className="font-semibold text-gray-800 mb-4 md:mb-5">Shipment Progress</h2>
            <div className="flex items-center gap-2">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-shrink-0 ${i < statusSteps.length - 1 ? "w-full" : ""}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        i <= currentStep
                          ? "text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      style={i <= currentStep ? { background: "#1e3a5f" } : {}}
                    >
                      {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center w-14 sm:w-20">
                      {step.replace(/_/g, " ")}
                    </div>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-1 -mt-5"
                      style={{ background: i < currentStep ? "#1e3a5f" : "#e5e7eb" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 no-print">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 md:mb-4">
              <Edit2 className="w-5 h-5" style={{ color: "#1e3a5f" }} />
              Update Status
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Delivery Partner</label>
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">None</option>
                  {deliveryPartners.map((dp) => (
                    <option key={dp.id} value={dp.id}>{dp.name} ({dp.vehicleNo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Current location"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Note</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Update note"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={updateStatus}
              disabled={updating}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#1e3a5f" }}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {updating ? "Updating..." : "Update"}
            </button>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 md:mb-4">
              <Clock className="w-5 h-5" style={{ color: "#1e3a5f" }} />
              Tracking History
            </h2>
            <div className="space-y-4">
              {shipment.trackingEvents.map((event: any, i: number) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ background: i === shipment.trackingEvents.length - 1 ? "#d4af37" : "#1e3a5f" }}
                    />
                    {i < shipment.trackingEvents.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace(/_/g, " ")}
                      </span>
                      {event.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: "#1e3a5f" }} />
              Customer
            </h2>
            <p className="font-medium text-gray-800">{shipment.customer?.name}</p>
            {shipment.customer?.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> {shipment.customer.phone}
              </p>
            )}
            {shipment.customer?.city && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {shipment.customer.city}
              </p>
            )}
            <Link
              href={`/dashboard/customers/${shipment.customerId}`}
              className="text-xs font-medium mt-2 inline-block hover:underline"
              style={{ color: "#1e3a5f" }}
            >
              View customer →
            </Link>
          </div>

          {/* Delivery Partner */}
          {shipment.deliveryPartner && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" style={{ color: "#1e3a5f" }} />
                Delivery Partner
              </h2>
              <p className="font-medium text-gray-800">{shipment.deliveryPartner.name}</p>
              {shipment.deliveryPartner.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {shipment.deliveryPartner.phone}
                </p>
              )}
              {shipment.deliveryPartner.vehicleNo && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Vehicle: {shipment.deliveryPartner.vehicleNo}
                </p>
              )}
            </div>
          )}

          {/* Payments */}
          {shipment.payments?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Payments</h2>
              <div className="space-y-2">
                {shipment.payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{p.mode}</span>
                      <div className="text-xs text-gray-400">{formatDate(p.date)}</div>
                    </div>
                    <span className="font-semibold text-green-700">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
