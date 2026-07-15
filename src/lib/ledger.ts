import type { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

// Mirrors the increment applied at entry-creation time (see the shipment and
// payment POST routes): a SHIPMENT (or ADJUSTMENT) entry adds its amount to
// the balance, a PAYMENT entry subtracts it. Recomputing this way after a
// deletion keeps every remaining entry's runningBalance internally
// consistent, matching what would have been stored if the deleted entry had
// never existed.
export async function recalculateCustomerLedger(tx: TransactionClient, customerId: string): Promise<void> {
  const entries = await tx.ledgerEntry.findMany({
    where: { customerId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  let balance = 0;
  for (const entry of entries) {
    balance += entry.type === "PAYMENT" ? -entry.amount : entry.amount;
    if (balance !== entry.runningBalance) {
      await tx.ledgerEntry.update({ where: { id: entry.id }, data: { runningBalance: balance } });
    }
  }
}
