import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "@/components/payments/PaymentsClient";
import { buildPaymentWhere, buildPaymentOrderBy } from "@/lib/payment-filters";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    from?: string;
    to?: string;
    page?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const pageSize = 25;

  const where = buildPaymentWhere(sp);
  const orderBy = buildPaymentOrderBy(sp);

  const [payments, total, customers, totalAmount] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { customer: true, shipment: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.payment.aggregate({ where, _sum: { amount: true } }),
  ]);

  return (
    <PaymentsClient
      payments={JSON.parse(JSON.stringify(payments))}
      total={total}
      totalAmount={totalAmount._sum.amount ?? 0}
      customers={JSON.parse(JSON.stringify(customers))}
      page={page}
      pageSize={pageSize}
      searchParams={sp}
    />
  );
}
