"use client";
import { useRouter } from "next/navigation";
import { formatCurrency, getExpenseCategoryLabel } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Download, IndianRupee, Receipt, Building2 } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Monochrome Yale Blue tint ramp for categorical charts — no yellow/gold.
const PIE_COLORS = ["#1E3A5F", "#2C4C74", "#3D5F89", "#5578A3", "#7093BD", "#8FADD6", "#A9C4E3"];

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: "1px solid #E8E8E8",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
const TOOLTIP_LABEL_STYLE = { fontWeight: 600, color: "#1E3A5F", marginBottom: 4 };

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatCompactINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return formatCurrency(amount);
}

interface Props {
  stats: {
    revenue: number;
    shipments: number;
    expenses: number;
    expenseCount: number;
    profit: number;
  };
  trend: any[];
  expenseByCategory: any[];
  revenueByMode: any[];
  topCustomers: any[];
  officeBreakdown: any[];
  year: number;
  month: number;
  isAnnual: boolean;
}

export function ReportsClient({
  stats, trend, expenseByCategory, revenueByMode, topCustomers, officeBreakdown, year, month, isAnnual,
}: Props) {
  const router = useRouter();

  const trendData = isAnnual
    ? MONTHS.map((label, i) => {
        const found = trend.find((d: any) => Number(d.period) === i + 1);
        return { label, revenue: Number(found?.revenue ?? 0), shipments: Number(found?.shipments ?? 0) };
      })
    : Array.from({ length: daysInMonth(year, month) }, (_, i) => {
        const found = trend.find((d: any) => Number(d.period) === i + 1);
        return { label: String(i + 1), revenue: Number(found?.revenue ?? 0), shipments: Number(found?.shipments ?? 0) };
      });

  const expenseData = expenseByCategory.map(e => ({
    name: getExpenseCategoryLabel(e.category),
    value: e._sum.amount ?? 0,
  }));

  const modeData = revenueByMode.map(m => ({
    name: m.mode,
    revenue: m._sum.amount ?? 0,
    count: m._count,
  }));

  const totalModeRevenue = modeData.reduce((s, m) => s + m.revenue, 0);

  // Derived client-side from the already-fetched office breakdown — no new query.
  const topOffice = officeBreakdown.length > 0
    ? officeBreakdown.reduce((best: any, o: any) => ((o._sum.amount ?? 0) > (best._sum.amount ?? 0) ? o : best))
    : null;

  const marginPct = stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0;
  const periodWord = isAnnual ? "this year" : "this month";

  const kpiCards = [
    {
      label: "Revenue",
      value: formatCurrency(stats.revenue),
      sub: `${stats.shipments} shipments ${periodWord}`,
      icon: IndianRupee,
      valueColor: "text-gray-900",
    },
    {
      label: "Expenses",
      value: formatCurrency(stats.expenses),
      sub: `${stats.expenseCount} expense ${stats.expenseCount === 1 ? "entry" : "entries"} recorded`,
      icon: Receipt,
      valueColor: "text-gray-900",
    },
    {
      label: "Net Profit",
      value: formatCurrency(stats.profit),
      sub: stats.revenue > 0 ? `${marginPct}% margin` : (stats.profit >= 0 ? "Breakeven" : "Loss recorded"),
      icon: stats.profit >= 0 ? TrendingUp : TrendingDown,
      valueColor: stats.profit >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Top Performing Office",
      value: topOffice?.office?.city ?? "—",
      sub: topOffice ? `${formatCompactINR(topOffice._sum.amount ?? 0)} revenue` : "No data yet",
      icon: Building2,
      valueColor: "text-gray-900",
    },
  ];

  function exportCSV() {
    const periodLabel = isAnnual ? `Year ${year}` : `${MONTH_NAMES_FULL[month - 1]} ${year}`;
    const rows = [
      ["Period", "Revenue", "Expenses", "Profit", "Shipments"],
      [periodLabel, stats.revenue, stats.expenses, stats.profit, stats.shipments],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = isAnnual ? `pnl-report-${year}-annual.csv` : `pnl-report-${year}-${MONTHS[month - 1].toLowerCase()}.csv`;
    a.click();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold leading-tight flex items-center gap-2.5 md:text-[36px]" style={{ color: "#1E3A5F" }}>
            <BarChart3 className="w-6 h-6 md:w-7 md:h-7" /> Reports & Profit/Loss
          </h1>
          <p className="text-xs text-gray-500 mt-1 md:text-[13px]">
            Financial overview for {isAnnual ? year : `${MONTH_NAMES_FULL[month - 1]} ${year}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={year} onChange={e => router.push(`/dashboard/reports?year=${e.target.value}&month=${month}`)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
            {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => router.push(`/dashboard/reports?year=${year}&month=${e.target.value}`)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
            <option value={0}>Annual</option>
            {MONTH_NAMES_FULL.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
            <card.icon className="w-4 h-4" style={{ color: "#1E3A5F" }} strokeWidth={2} />
            <div className={`text-xl font-bold leading-tight mt-2 md:text-[36px] ${card.valueColor}`}>{card.value}</div>
            <div className="text-xs font-medium text-gray-700 mt-1 md:text-sm md:mt-1.5">{card.label}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 md:text-[13px]">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-2 md:text-[22px] md:mb-3">
          {isAnnual ? "Monthly Revenue" : `Daily Revenue — ${MONTH_NAMES_FULL[month - 1]}`}
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trendData} barCategoryGap={isAnnual ? "20%" : "30%"}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={isAnnual ? 0 : 2} />
            <YAxis tick={{ fontSize: 11 }} tickCount={5} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="revenue" fill="#1E3A5F" radius={[3, 3, 0, 0]} name="Revenue" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-5 items-start">
        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-2 md:text-[22px] md:mb-3">Expense Breakdown</h2>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseData} dataKey="value" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}k`}>
                  {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">No Expenses Recorded</p>
              <p className="text-[13px] text-gray-400 max-w-[240px] leading-relaxed">
                Expense data will appear here once expenses are added.
              </p>
            </div>
          )}
        </div>

        {/* Revenue by Mode */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-2 md:text-[22px] md:mb-3">Revenue by Transport Mode</h2>
          {modeData.length > 0 ? (
            <div className="space-y-3">
              {modeData.map((m) => {
                const pct = totalModeRevenue > 0 ? (m.revenue / totalModeRevenue) * 100 : 0;
                return (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 capitalize">{m.name.toLowerCase()}</span>
                      <span className="text-gray-600">
                        {formatCurrency(m.revenue)} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1E3A5F" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">No Shipments Found</p>
              <p className="text-[13px] text-gray-400 max-w-[240px] leading-relaxed">
                No revenue available for this period.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-2 md:text-[22px] md:mb-3">Top 5 Customers by Revenue</h2>
          {topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left font-semibold py-2 pr-2">#</th>
                    <th className="text-left font-semibold py-2">Customer</th>
                    <th className="text-right font-semibold py-2">Revenue</th>
                    <th className="text-right font-semibold py-2">Shipments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topCustomers.map((c, i) => (
                    <tr key={c.customerId}>
                      <td className="py-2.5 pr-2 text-gray-400">{i + 1}</td>
                      <td className="py-2.5 font-medium text-gray-800">{c.customer?.name ?? "Unknown"}</td>
                      <td className="py-2.5 text-right font-semibold" style={{ color: "#1E3A5F" }}>
                        {formatCurrency(c._sum.amount ?? 0)}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">{c._count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">No Shipments Found</p>
              <p className="text-[13px] text-gray-400 max-w-[240px] leading-relaxed">
                Customer revenue will appear here once shipments are booked.
              </p>
            </div>
          )}
        </div>

        {/* Office Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-2 md:text-[22px] md:mb-3">Revenue by Office</h2>
          {officeBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left font-semibold py-2">Office</th>
                    <th className="text-right font-semibold py-2">Revenue</th>
                    <th className="text-right font-semibold py-2">Shipments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {officeBreakdown.map((o) => (
                    <tr key={o.officeId}>
                      <td className="py-2.5 font-medium text-gray-800">{o.office?.city ?? "Unknown"}</td>
                      <td className="py-2.5 text-right font-semibold" style={{ color: "#1E3A5F" }}>
                        {formatCurrency(o._sum.amount ?? 0)}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">{o._count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">No Shipments Found</p>
              <p className="text-[13px] text-gray-400 max-w-[240px] leading-relaxed">
                Office revenue will appear here once shipments are booked.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
