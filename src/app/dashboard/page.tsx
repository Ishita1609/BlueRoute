import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const officeId = (session?.user as any)?.officeId;

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const whereClause = role === "SUPER_ADMIN" ? {} : { officeId: officeId ?? undefined };

  const [
    todayShipments,
    monthShipments,
    totalCustomers,
    todayRevenue,
    monthRevenue,
    pendingShipments,
    monthExpenses,
    recentShipments,
    shipmentsByMode,
    dailyTrend,
  ] = await Promise.all([
    prisma.shipment.count({ where: { ...whereClause, date: { gte: startOfDay } } }),
    prisma.shipment.count({ where: { ...whereClause, date: { gte: startOfMonth } } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.shipment.aggregate({ where: { ...whereClause, date: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.shipment.aggregate({ where: { ...whereClause, date: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.shipment.count({ where: { ...whereClause, status: { in: ["BOOKED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } } }),
    prisma.expense.aggregate({ where: { ...(role !== "SUPER_ADMIN" ? { officeId } : {}), date: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.shipment.findMany({
      where: whereClause,
      include: { customer: true, office: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.shipment.groupBy({
      by: ["mode"],
      where: { ...whereClause, date: { gte: startOfMonth } },
      _count: true,
      _sum: { amount: true },
    }),
    // Last 7 days trend
    prisma.$queryRaw<{ day: string; revenue: number; count: number }[]>`
      SELECT
        DATE_TRUNC('day', date)::text as day,
        SUM(amount) as revenue,
        COUNT(*)::int as count
      FROM "Shipment"
      WHERE date >= NOW() - INTERVAL '7 days'
      ${role !== "SUPER_ADMIN" && officeId ? Prisma.sql`AND "officeId" = ${officeId}` : Prisma.empty}
      GROUP BY DATE_TRUNC('day', date)
      ORDER BY day ASC
    `.catch(() => []),
  ]);

  const monthProfit = (monthRevenue._sum.amount ?? 0) - (monthExpenses._sum.amount ?? 0);

  return (
    <DashboardClient
      stats={{
        todayShipments,
        monthShipments,
        totalCustomers,
        todayRevenue: todayRevenue._sum.amount ?? 0,
        monthRevenue: monthRevenue._sum.amount ?? 0,
        pendingShipments,
        monthExpenses: monthExpenses._sum.amount ?? 0,
        monthProfit,
      }}
      recentShipments={JSON.parse(JSON.stringify(recentShipments))}
      shipmentsByMode={JSON.parse(JSON.stringify(shipmentsByMode))}
      dailyTrend={JSON.parse(JSON.stringify(dailyTrend))}
    />
  );
}
