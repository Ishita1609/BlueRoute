export interface ExpenseSearchParams {
  category?: string;
  officeId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDir?: string;
}

/** Shared by the Expenses page and the CSV export route so filtering never drifts between the two. */
export function buildExpenseWhere(sp: ExpenseSearchParams, role: string, userOfficeId?: string | null) {
  const where: any = {
    ...(role !== "SUPER_ADMIN" && userOfficeId ? { officeId: userOfficeId } : {}),
    ...(sp.category ? { category: sp.category } : {}),
    ...(sp.officeId && role === "SUPER_ADMIN" ? { officeId: sp.officeId } : {}),
    ...(sp.from || sp.to
      ? {
          date: {
            ...(sp.from ? { gte: new Date(sp.from) } : {}),
            ...(sp.to ? { lte: new Date(sp.to + "T23:59:59") } : {}),
          },
        }
      : {}),
  };
  return where;
}

export function buildExpenseOrderBy(sp: ExpenseSearchParams) {
  const sortBy = sp.sortBy ?? "date";
  const sortDir: "asc" | "desc" = sp.sortDir === "asc" ? "asc" : "desc";
  const orderByMap: Record<string, any> = {
    date: { date: sortDir },
    amount: { amount: sortDir },
    category: { category: sortDir },
    office: { office: { city: sortDir } },
  };
  return orderByMap[sortBy] ?? { date: "desc" };
}
