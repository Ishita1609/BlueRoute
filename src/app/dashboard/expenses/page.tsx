import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";
import { buildExpenseWhere, buildExpenseOrderBy } from "@/lib/expense-filters";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    officeId?: string;
    from?: string;
    to?: string;
    page?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userOfficeId = (session?.user as any)?.officeId;

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const pageSize = 25;

  const where = buildExpenseWhere(sp, role, userOfficeId);
  const orderBy = buildExpenseOrderBy(sp);

  const [expenses, total, offices, totalAmount, byCategory] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { office: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
    prisma.office.findMany({ where: { isActive: true } }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["category"], where, _sum: { amount: true } }),
  ]);

  return (
    <ExpensesClient
      expenses={JSON.parse(JSON.stringify(expenses))}
      total={total}
      totalAmount={totalAmount._sum.amount ?? 0}
      byCategory={JSON.parse(JSON.stringify(byCategory))}
      offices={JSON.parse(JSON.stringify(offices))}
      role={role}
      page={page}
      pageSize={pageSize}
      searchParams={sp}
    />
  );
}
