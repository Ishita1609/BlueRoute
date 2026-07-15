import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/reports/ReportsClient";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const year = parseInt(sp.year ?? String(new Date().getFullYear()));
  const monthParam = parseInt(sp.month ?? "0"); // 0 = Annual (default)
  const isAnnual = Number.isNaN(monthParam) || monthParam === 0;
  const month = isAnnual ? 0 : monthParam;

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  const monthStart = new Date(year, Math.max(month - 1, 0), 1);
  const monthEnd = new Date(year, Math.max(month, 1), 0, 23, 59, 59);

  const scopeStart = isAnnual ? yearStart : monthStart;
  const scopeEnd = isAnnual ? yearEnd : monthEnd;

  const [
    revenueAgg,
    expenseAgg,
    trendRaw,
    expenseByCategory,
    revenueByMode,
    topCustomers,
    officeBreakdown,
  ] = await Promise.all([
    prisma.shipment.aggregate({ where: { date: { gte: scopeStart, lte: scopeEnd } }, _sum: { amount: true }, _count: true }),
    prisma.expense.aggregate({ where: { date: { gte: scopeStart, lte: scopeEnd } }, _sum: { amount: true }, _count: true }),
    // Annual view trends by month (Jan–Dec); a selected month trends by day instead.
    isAnnual
      ? prisma.$queryRaw<{ period: number; revenue: number; shipments: bigint }[]>`
          SELECT
            EXTRACT(MONTH FROM date)::int as period,
            SUM(amount) as revenue,
            COUNT(*) as shipments
          FROM "Shipment"
          WHERE EXTRACT(YEAR FROM date) = ${year}
          GROUP BY EXTRACT(MONTH FROM date)
          ORDER BY period
        `.catch(() => [])
      : prisma.$queryRaw<{ period: number; revenue: number; shipments: bigint }[]>`
          SELECT
            EXTRACT(DAY FROM date)::int as period,
            SUM(amount) as revenue,
            COUNT(*) as shipments
          FROM "Shipment"
          WHERE date >= ${monthStart} AND date <= ${monthEnd}
          GROUP BY EXTRACT(DAY FROM date)
          ORDER BY period
        `.catch(() => []),
    prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: scopeStart, lte: scopeEnd } },
      _sum: { amount: true },
    }),
    prisma.shipment.groupBy({
      by: ["mode"],
      where: { date: { gte: scopeStart, lte: scopeEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.shipment.groupBy({
      by: ["customerId"],
      where: { date: { gte: scopeStart, lte: scopeEnd } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.shipment.groupBy({
      by: ["officeId"],
      where: { date: { gte: scopeStart, lte: scopeEnd } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const customerIds = topCustomers.map((c) => c.customerId);
  const officeIds = officeBreakdown.map((o) => o.officeId);

  const [customerDetails, officeDetails] = await Promise.all([
    prisma.customer.findMany({ where: { id: { in: customerIds } } }),
    prisma.office.findMany({ where: { id: { in: officeIds } } }),
  ]);

  const enrichedTopCustomers = topCustomers.map((c) => ({
    ...c,
    customer: customerDetails.find((cd) => cd.id === c.customerId),
  }));

  const enrichedOffices = officeBreakdown.map((o) => ({
    ...o,
    office: officeDetails.find((od) => od.id === o.officeId),
  }));

  const profit = (revenueAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0);

  return (
    <ReportsClient
      year={year}
      month={month}
      isAnnual={isAnnual}
      stats={{
        revenue: revenueAgg._sum.amount ?? 0,
        shipments: revenueAgg._count,
        expenses: expenseAgg._sum.amount ?? 0,
        expenseCount: expenseAgg._count,
        profit,
      }}
      trend={JSON.parse(
        JSON.stringify(trendRaw, (_key, value) => (typeof value === "bigint" ? Number(value) : value))
      )}
      expenseByCategory={JSON.parse(JSON.stringify(expenseByCategory))}
      revenueByMode={JSON.parse(JSON.stringify(revenueByMode))}
      topCustomers={JSON.parse(JSON.stringify(enrichedTopCustomers))}
      officeBreakdown={JSON.parse(JSON.stringify(enrichedOffices))}
    />
  );
}
