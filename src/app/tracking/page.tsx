"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Search, MapPin, Clock, ArrowLeft } from "lucide-react";
import { formatDateTime, getStatusColor, getModeIcon } from "@/lib/utils";

function TrackingForm() {
  const searchParams = useSearchParams();
  const [trackingNo, setTrackingNo] = useState(searchParams.get("number") ?? "");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function track(e?: React.FormEvent) {
    e?.preventDefault();
    if (!trackingNo.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    const res = await fetch(`/api/tracking?number=${encodeURIComponent(trackingNo.trim())}`);
    if (res.ok) setResult(await res.json());
    else setNotFound(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "#f0f4f8" }}>
      <nav className="navy-gradient shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4" style={{ color: "#1e3a5f" }} />
            </div>
            <span className="text-white font-bold">BlueRoute Logistics</span>
          </Link>
          <Link href="/" className="text-blue-200 hover:text-white text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-5 md:mb-8">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: "#1e3a5f" }}>Track Your Shipment</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Enter your tracking number for real-time updates</p>
        </div>

        <form onSubmit={track} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 md:p-6 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
          <div className="flex gap-3">
            <input
              value={trackingNo}
              onChange={e => setTrackingNo(e.target.value)}
              placeholder="e.g. CL-2024-00123"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button type="submit" disabled={loading}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#1e3a5f" }}>
              {loading ? "..." : <Search className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {notFound && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center md:p-8">
            <Package className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="font-semibold text-red-700">Shipment Not Found</p>
            <p className="text-sm text-red-400 mt-1">Please check the tracking number and try again.</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-5" style={{ background: "#1e3a5f" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-mono font-bold">{result.trackingNumber}</div>
                  <div className="text-blue-200 text-sm mt-0.5">
                    {getModeIcon(result.mode)} {result.fromCity} → {result.toCity}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm md:p-5">
              <div><div className="text-gray-500 text-xs">Packets</div><div className="font-medium">{result.packets} PCS</div></div>
              <div><div className="text-gray-500 text-xs">Weight</div><div className="font-medium">{result.weight} kg</div></div>
              <div><div className="text-gray-500 text-xs">Customer</div><div className="font-medium">{result.customer?.name}</div></div>
            </div>
            <div className="p-4 md:p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2 md:mb-4">
                <Clock className="w-4 h-4" style={{ color: "#1e3a5f" }} /> Tracking History
              </h3>
              <div className="space-y-3 md:space-y-4">
                {result.trackingEvents?.map((event: any, i: number) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full mt-1"
                        style={{ background: i === result.trackingEvents.length - 1 ? "#d4af37" : "#1e3a5f" }} />
                      {i < result.trackingEvents.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(event.status)}`}>
                          {event.status.replace(/_/g, " ")}
                        </span>
                        {event.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicTrackingPage() {
  return (
    <Suspense>
      <TrackingForm />
    </Suspense>
  );
}
