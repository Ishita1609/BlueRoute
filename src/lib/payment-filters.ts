export interface PaymentSearchParams {
  customerId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDir?: string;
}

/** Shared by the Payments page and the CSV export route so filtering never drifts between the two. */
export function buildPaymentWhere(sp: PaymentSearchParams) {
  return {
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
}

export function buildPaymentOrderBy(sp: PaymentSearchParams) {
  const sortBy = sp.sortBy ?? "date";
  const sortDir: "asc" | "desc" = sp.sortDir === "asc" ? "asc" : "desc";
  const orderByMap: Record<string, any> = {
    date: { date: sortDir },
    amount: { amount: sortDir },
    mode: { mode: sortDir },
    customer: { customer: { name: sortDir } },
  };
  return orderByMap[sortBy] ?? { date: "desc" };
}
