// One-time cleanup script — NOT part of application logic, not imported by
// any route. Targets legacy PAYMENT-type LedgerEntry rows created before the
// LedgerEntry.paymentId relation existed, where the Payment that originally
// created them has since been deleted (the old DELETE /api/payments/[id]
// route did not clean up its ledger entry — fixed separately in the route).
//
// "Orphan" = type=PAYMENT, paymentId IS NULL, AND no Payment row exists with
// the same customerId + amount + date (the values every such entry was
// created with, in lockstep, by the payment-creation route).
//
// Defaults to a dry run (reports only, deletes nothing). To actually delete:
//   npx tsx prisma/cleanup-orphan-ledger-entries.ts --delete

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shouldDelete = process.argv.includes("--delete");

  const candidates = await prisma.ledgerEntry.findMany({
    where: { type: "PAYMENT", paymentId: null },
    include: { customer: { select: { name: true } } },
  });

  const orphans: typeof candidates = [];

  for (const entry of candidates) {
    const matchingPayment = await prisma.payment.findFirst({
      where: { customerId: entry.customerId, amount: entry.amount, date: entry.date },
      select: { id: true },
    });
    if (!matchingPayment) orphans.push(entry);
  }

  console.log(`Checked ${candidates.length} unlinked PAYMENT ledger entries.`);
  console.log(`Found ${orphans.length} orphan(s) with no corresponding Payment:\n`);
  for (const o of orphans) {
    console.log(
      `  - ${o.id} | customer=${o.customer?.name ?? o.customerId} | amount=₹${o.amount} | date=${o.date.toISOString().slice(0, 10)}`
    );
  }

  if (orphans.length === 0) {
    console.log("\nNothing to delete.");
    return;
  }

  if (!shouldDelete) {
    console.log("\nDRY RUN — no rows deleted. Re-run with --delete to remove the entries listed above.");
    return;
  }

  const result = await prisma.ledgerEntry.deleteMany({ where: { id: { in: orphans.map((o) => o.id) } } });
  console.log(`\nDeleted ${result.count} orphaned ledger entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
