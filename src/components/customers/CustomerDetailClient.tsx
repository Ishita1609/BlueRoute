"use client";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  customer: any;
  shipments: any[];
  ledger: any[];
  totalAmount: number;
  totalPaid: number;
}

const BADGE_CLASS = "inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-white border border-gray-300 text-gray-700";

const MODE_LABELS: Record<string, string> = { ROAD: "Road", TRAIN: "Train", AIR: "Air" };

export function CustomerDetailClient({ customer, shipments, ledger, totalAmount, totalPaid }: Props) {
  const balance = totalAmount - totalPaid;

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>{customer.name}</h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">{customer.city}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Customer Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 md:mb-4">Customer Details</h2>
            <div className="space-y-3 text-sm">
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" /> {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {customer.email}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" /> {customer.address}
                </div>
              )}
              {customer.gstNumber && (
                <div className="text-gray-600">
                  <span className="text-gray-400">GST: </span>{customer.gstNumber}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 md:mb-4">Rates (₹/kg)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Road</span>
                <span className="font-medium text-gray-800">₹{customer.defaultRateRoad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Train</span>
                <span className="font-medium text-gray-800">₹{customer.defaultRateTrain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Air</span>
                <span className="font-medium text-gray-800">₹{customer.defaultRateAir}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Credit Limit</span>
                <span className="font-medium text-gray-800">{formatCurrency(customer.creditLimit)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center md:p-4">
              <div className="text-lg font-bold" style={{ color: "#1E3A5F" }}>{formatCurrency(totalAmount)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total Billed</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center md:p-4">
              <div className="text-lg font-bold" style={{ color: "#1E3A5F" }}>{formatCurrency(totalPaid)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total Paid</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center md:p-4">
              <div className="text-lg font-bold" style={{ color: "#1E3A5F" }}>{formatCurrency(Math.abs(balance))}</div>
              <div className="text-xs text-gray-500 mt-0.5">{balance > 0 ? "Balance Due" : "Overpaid"}</div>
            </div>
          </div>
        </div>

        {/* Shipments + Ledger */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Shipments */}
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 md:px-5 md:py-4 flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: "#1E3A5F" }} />
              <h2 className="text-sm font-semibold text-gray-800">Recent Shipments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "#DCE9F7" }}>
                  <tr>
                    {["Date", "Tracking", "Mode", "Route", "Wt", "Amount", "Status"].map(h => (
                      <th key={h}
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 md:px-4 md:py-3"
                        style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipments.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap md:px-4 md:py-2.5">{formatDate(s.date)}</td>
                      <td className="px-3 py-2 md:px-4 md:py-2.5">
                        <Link href={`/dashboard/shipments/${s.id}`} className="font-mono text-xs font-medium hover:underline" style={{ color: "#1E3A5F" }}>
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-2.5">
                        <span className={BADGE_CLASS}>{MODE_LABELS[s.mode] ?? s.mode}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap md:px-4 md:py-2.5">{s.fromCity} → {s.toCity}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 md:px-4 md:py-2.5">{s.weight}kg</td>
                      <td className="px-3 py-2 font-medium text-xs text-gray-900 md:px-4 md:py-2.5">{formatCurrency(s.amount)}</td>
                      <td className="px-3 py-2 md:px-4 md:py-2.5">
                        <span className={BADGE_CLASS}>{s.status.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No shipments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger */}
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 md:px-5 md:py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Customer Ledger</h2>
              <Link href={`/dashboard/ledger?customerId=${customer.id}`} className="text-xs font-medium hover:underline" style={{ color: "#1E3A5F" }}>
                Full ledger →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "#DCE9F7" }}>
                  <tr>
                    {["Date", "PCS", "WT", "Rate", "Amount", "Paid", "Balance"].map((h, i) => (
                      <th key={h}
                        className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 md:px-4 md:py-3 ${i === 0 ? "text-left" : "text-right"}`}
                        style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledger.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap md:px-4 md:py-2.5">{formatDate(e.date)}</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-600 md:px-4 md:py-2.5">{e.pieces ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-600 md:px-4 md:py-2.5">{e.weight ? `${e.weight}kg` : "—"}</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-600 md:px-4 md:py-2.5">{e.rate ? `₹${e.rate}` : "—"}</td>
                      <td className="px-3 py-2 text-xs text-right font-medium text-gray-900 md:px-4 md:py-2.5">{formatCurrency(e.amount)}</td>
                      <td className="px-3 py-2 text-xs text-right text-gray-700 md:px-4 md:py-2.5">{formatCurrency(e.paymentReceived)}</td>
                      <td className="px-3 py-2 text-xs text-right font-bold md:px-4 md:py-2.5" style={{ color: "#1E3A5F" }}>
                        {formatCurrency(e.runningBalance)}
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-sm">No ledger entries</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
