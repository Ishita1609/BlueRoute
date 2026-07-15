import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/customers/CustomerDetailClient";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [customer, shipments, ledger, totalAmount, totalPaid] = await Promise.all([
    prisma.customer.findUnique({ where: { id } }),
    prisma.shipment.findMany({
      where: { customerId: id },
      include: { office: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.ledgerEntry.findMany({
      where: { customerId: id },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.shipment.aggregate({
      where: { customerId: id },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { customerId: id },
      _sum: { amount: true },
    }),
  ]);

  if (!customer) notFound();

  return (
    <CustomerDetailClient
      customer={JSON.parse(JSON.stringify(customer))}
      shipments={JSON.parse(JSON.stringify(shipments))}
      ledger={JSON.parse(JSON.stringify(ledger))}
      totalAmount={totalAmount._sum.amount ?? 0}
      totalPaid={totalPaid._sum.amount ?? 0}
    />
  );
}
