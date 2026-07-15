import { prisma } from "@/lib/prisma";
import { LedgerClient } from "@/components/ledger/LedgerClient";

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;

  const where: any = {
    ...(sp.customerId ? { customerId: sp.customerId } : {}),
    ...(sp.from || sp.to
      ? {
          date: {
            ...(sp.from ? { gte: new Date(sp.from) } : {}),
            ...(sp.to ? { lte: new Date(sp.to + "T23:59:59") } : {}),
          },
        }
      : {}),
  };

  const [customers, entries] = await Promise.all([
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.ledgerEntry.findMany({
      where,
      include: { customer: true, shipment: true },
      orderBy: { date: "asc" },
      take: 200,
    }),
  ]);

  return (
    <LedgerClient
      entries={JSON.parse(JSON.stringify(entries))}
      customers={JSON.parse(JSON.stringify(customers))}
      searchParams={sp}
    />
  );
}
