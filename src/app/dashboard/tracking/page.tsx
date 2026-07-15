"use client";
import { useState } from "react";
import { Search, MapPin, Clock, Package, Printer, Loader2 } from "lucide-react";
import { formatDateTime, formatDate, formatCurrency } from "@/lib/utils";

function formatMode(mode: string): string {
  switch (mode) {
    case "ROAD": return "Road";
    case "TRAIN": return "Train";
    case "AIR": return "Air";
    default: return mode;
  }
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "BOOKED": return "bg-gray-100 text-gray-700";
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY": return "bg-yellow-100 text-yellow-800";
    case "DELIVERED": return "bg-green-100 text-green-800";
    case "CANCELLED":
    case "RETURNED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function TrackingPage() {
  const [trackingNo, setTrackingNo] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNo.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);

    const res = await fetch(`/api/tracking?number=${encodeURIComponent(trackingNo.trim())}`);
    if (res.ok) {
      setResult(await res.json());
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>
          Shipment Tracking
        </h1>
        <p className="text-xs text-gray-500 mt-1 md:text-[13px]">Track any shipment by its tracking number</p>
      </div>

      {/* Search Toolbar */}
      <form onSubmit={track} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 block mb-2">
          Tracking Number
        </label>
        <input
          value={trackingNo}
          onChange={e => setTrackingNo(e.target.value)}
          placeholder="e.g. CL-2024-00123"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
        />
        <div className="flex items-center justify-end gap-3 mt-3 md:mt-4">
          {result && (
            <button type="button" onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
              style={{ color: "#1E3A5F" }}>
              <Printer className="w-4 h-4" /> Print
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-60"
            style={{ background: "#1E3A5F" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Tracking..." : "Track Shipment"}
          </button>
        </div>
      </form>

      {/* Empty / Not Found State */}
      {!result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-10 px-5 text-center md:py-16 md:px-6">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-sm text-gray-700">No shipment found</p>
          <p className="text-sm text-gray-400 mt-1">
            {notFound
              ? "No shipment matches that tracking number. Please check and try again."
              : "Enter a valid tracking number to view shipment details."}
          </p>
        </div>
      )}

      {result && (
        <>
          {/* Compact Summary Strip */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 px-1">
            <span>{formatMode(result.mode)}</span>
            <span className="text-gray-300">•</span>
            <span>{result.fromCity} → {result.toCity}</span>
            <span className="text-gray-300">•</span>
            <span>{result.weight} kg</span>
            <span className="text-gray-300">•</span>
            <span>{result.packets} {result.packets === 1 ? "Piece" : "Pieces"}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-gray-900">{formatCurrency(result.amount)}</span>
          </div>

          {/* Shipment Details Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="font-mono font-bold text-lg text-gray-900">{result.trackingNumber}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${statusBadgeClass(result.status)}`}>
                  {formatStatusLabel(result.status)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {formatMode(result.mode)} • {result.fromCity} → {result.toCity}
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 text-sm md:p-5 md:gap-y-5">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Customer</div>
                <div className="font-medium text-gray-900">{result.customer?.name ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Weight</div>
                <div className="font-medium text-gray-900">{result.weight} kg</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Pieces</div>
                <div className="font-medium text-gray-900">{result.packets}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Amount</div>
                <div className="font-medium text-gray-900">{formatCurrency(result.amount)}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Booking Date</div>
                <div className="font-medium text-gray-900">{formatDate(result.date)}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Destination</div>
                <div className="font-medium text-gray-900">{result.toCity}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Current Status</div>
                <div className="font-medium text-gray-900">{formatStatusLabel(result.status)}</div>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
            <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2 md:mb-5">
              <Clock className="w-4 h-4" style={{ color: "#1E3A5F" }} /> Tracking History
            </h3>
            <div>
              {result.trackingEvents?.map((event: any, i: number) => {
                const isLast = i === result.trackingEvents.length - 1;
                return (
                  <div key={event.id} className="flex gap-4 rounded-lg -mx-3 px-3 transition-colors duration-150 hover:bg-gray-50">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full ring-4 ring-white flex-shrink-0 mt-1.5"
                        style={{ background: isLast ? "#1E3A5F" : "#CBD5E1" }}
                      />
                      {i < result.trackingEvents.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200" />
                      )}
                    </div>
                    <div className="pb-5 pt-1 md:pb-7">
                      <p className="font-semibold text-sm text-gray-900">{formatStatusLabel(event.status)}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              {(!result.trackingEvents || result.trackingEvents.length === 0) && (
                <p className="text-gray-400 text-sm py-2">No tracking events yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
