"use client";
import {
  Package,
  TrendingUp,
  Users,
  Clock,
  IndianRupee,
  ArrowUpRight,
  UserPlus,
  Train,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface Props {
  stats: {
    todayShipments: number;
    monthShipments: number;
    totalCustomers: number;
    todayRevenue: number;
    monthRevenue: number;
    pendingShipments: number;
    monthExpenses: number;
    monthProfit: number;
  };
  recentShipments: any[];
  shipmentsByMode: any[];
  dailyTrend: any[];
}

const BADGE_CLASS = "inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-white border border-gray-300 text-gray-700";

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #E8E8E8",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
const TOOLTIP_LABEL_STYLE = { fontWeight: 600, color: "#1E3A5F", marginBottom: 4 };

const MODE_LABELS: Record<string, string> = { ROAD: "Road", TRAIN: "Train", AIR: "Air" };

function formatMode(mode: string): string {
  return MODE_LABELS[mode] || mode;
}

export function DashboardClient({ stats, recentShipments, shipmentsByMode, dailyTrend }: Props) {
  const statCards = [
    {
      label: "Today's Shipments",
      value: stats.todayShipments,
      icon: <Package className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: `${stats.monthShipments} this month`,
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: <IndianRupee className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: formatCurrency(stats.monthRevenue) + " this month",
    },
    {
      label: "Pending Deliveries",
      value: stats.pendingShipments,
      icon: <Clock className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: "Awaiting delivery",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: <Users className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: "Active accounts",
    },
    {
      label: "Month Expenses",
      value: formatCurrency(stats.monthExpenses),
      icon: <TrendingUp className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: "This month",
    },
    {
      label: "Month Profit",
      value: formatCurrency(stats.monthProfit),
      icon: <ArrowUpRight className="w-5 h-5" style={{ color: "#1E3A5F" }} />,
      sub: "Revenue − Expenses",
    },
  ];

  const modeSummary = shipmentsByMode.map((m) => ({
    name: formatMode(m.mode),
    count: m._count as number,
  }));
  const totalModeCount = modeSummary.reduce((s, m) => s + m.count, 0);

  const trendData = dailyTrend.map((d: any) => ({
    day: new Date(d.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    revenue: Number(d.revenue || 0),
    count: Number(d.count || 0),
  }));

  const pendingDeliveries = recentShipments.filter((s) =>
    ["BOOKED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s.status)
  );

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="pb-2 sm:pb-0">
        <h1 className="text-xl font-bold leading-tight md:text-[32px]" style={{ color: "#1E3A5F" }}>Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1 md:text-[13px]">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat Cards — mobile: dense 2-column grid, icon+title on one line */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-300 shadow-sm p-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center">
                {card.icon}
              </div>
              <div className="text-xs font-medium leading-tight text-gray-700">{card.label}</div>
            </div>
            <div className="mt-2 text-lg font-bold leading-tight" style={{ color: "#1E3A5F" }}>{card.value}</div>
            <div className="text-[11px] leading-tight text-gray-500 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Stat Cards — tablet/desktop, unchanged */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-300 shadow-sm p-3 md:p-5"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center mb-2 md:w-9 md:h-9 md:mb-3">
              {card.icon}
            </div>
            <div className="text-lg font-bold leading-tight md:text-2xl" style={{ color: "#1E3A5F" }}>{card.value}</div>
            <div className="text-xs font-medium text-gray-700 mt-1 md:text-sm md:mt-1.5">{card.label}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 md:text-[13px]">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3 md:text-[18px] md:mb-4">Revenue Trend (Last 7 Days)</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1E3A5F"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#1E3A5F" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
              No revenue data for the last 7 days
            </div>
          )}
        </div>

        {/* Shipment Mode Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3 md:text-[18px] md:mb-4">Shipments by Mode</h2>
          {modeSummary.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {modeSummary.map((m) => {
                const pct = totalModeCount > 0 ? (m.count / totalModeCount) * 100 : 0;
                return (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{m.name}</span>
                      <span className="text-gray-500">{m.count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1E3A5F" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No data for this period
            </div>
          )}
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:px-6 md:py-4">
          <h2 className="text-base font-semibold text-gray-800 md:text-[18px]">Recent Shipments</h2>
          <Link href="/dashboard/shipments" className="text-sm font-medium hover:underline" style={{ color: "#1E3A5F" }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#DCE9F7" }}>
              <tr>
                {["Tracking #", "Customer", "Mode", "Route", "Weight", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide border-b-2 md:px-4 md:py-3 md:text-[13px]"
                    style={{ color: "#1E3A5F", borderBottomColor: "#9DB7D4" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentShipments.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2 font-mono text-xs font-medium md:px-4 md:py-3.5" style={{ color: "#1E3A5F" }}>
                    <Link href={`/dashboard/shipments/${s.id}`}>{s.trackingNumber}</Link>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-800 md:px-4 md:py-3.5">{s.customer?.name}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3.5">
                    <span className={BADGE_CLASS}>{formatMode(s.mode)}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 md:px-4 md:py-3.5">{s.fromCity} → {s.toCity}</td>
                  <td className="px-3 py-2 text-gray-600 md:px-4 md:py-3.5">{s.weight} kg</td>
                  <td className="px-3 py-2 font-medium text-gray-800 md:px-4 md:py-3.5">{formatCurrency(s.amount)}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3.5">
                    <span className={BADGE_CLASS}>{s.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
              {recentShipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No shipments yet. <Link href="/dashboard/shipments/new" className="hover:underline" style={{ color: "#1E3A5F" }}>Create your first shipment →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Pending Deliveries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 md:px-6 md:py-4">
            <h2 className="text-base font-semibold text-gray-800 md:text-[18px]">Pending Deliveries</h2>
            <span className="text-sm text-gray-500">{stats.pendingShipments} total</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingDeliveries.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3">
                <div>
                  <Link href={`/dashboard/shipments/${s.id}`} className="font-mono text-xs font-medium hover:underline" style={{ color: "#1E3A5F" }}>
                    {s.trackingNumber}
                  </Link>
                  <p className="text-sm text-gray-700 mt-0.5">{s.customer?.name} · {s.fromCity} → {s.toCity}</p>
                </div>
                <span className={BADGE_CLASS}>{s.status.replace(/_/g, " ")}</span>
              </div>
            ))}
            {pendingDeliveries.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No pending deliveries.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3 md:text-[18px] md:mb-4">Quick Actions</h2>
          <div className="space-y-2 md:space-y-2.5">
            <Link
              href="/dashboard/shipments/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
              style={{ background: "#1E3A5F" }}
            >
              <Package className="w-4 h-4" /> New Shipment
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
              style={{ color: "#1E3A5F" }}
            >
              <UserPlus className="w-4 h-4" /> Add Customer
            </Link>
            <Link
              href="/dashboard/payments"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
              style={{ color: "#1E3A5F" }}
            >
              <CreditCard className="w-4 h-4" /> New Payment
            </Link>
            <Link
              href="/dashboard/manifest"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 transition-colors duration-150 hover:bg-gray-50"
              style={{ color: "#1E3A5F" }}
            >
              <Train className="w-4 h-4" /> Generate Train Manifest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
