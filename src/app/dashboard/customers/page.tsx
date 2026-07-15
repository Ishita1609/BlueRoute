import { prisma } from "@/lib/prisma";
import { CustomersClient } from "@/components/customers/CustomersClient";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const pageSize = 20;

  const where: any = sp.search
    ? {
        OR: [
          { name: { contains: sp.search, mode: "insensitive" } },
          { phone: { contains: sp.search } },
          { city: { contains: sp.search, mode: "insensitive" } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { shipments: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <CustomersClient
      customers={JSON.parse(JSON.stringify(customers))}
      total={total}
      page={page}
      pageSize={pageSize}
      searchParams={sp}
    />
  );
}
