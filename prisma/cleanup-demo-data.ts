// REVIEW-ONLY SCRIPT — NOT EXECUTED.
// Generated during production-hardening Phase 4. Targets ONLY the fixed,
// hardcoded IDs/values created by prisma/seed.ts, so it cannot match any
// real record created later through the app (those get random cuid() ids).
//
// Run only after explicit approval, e.g.: npx tsx prisma/cleanup-demo-data.ts
//
// Structured in independently-approvable sections — comment out any section
// you don't want to run.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CUSTOMER_IDS = ["cust-001", "cust-002", "cust-003", "cust-004", "cust-005"];
const DEMO_SHIPMENT_IDS = ["ship-001", "ship-002", "ship-003", "ship-004", "ship-005"];
const DEMO_MANIFEST_IDS = ["manifest-001"];
const DEMO_DELIVERY_PARTNER_IDS = ["dp-001", "dp-002"];
const DEMO_OFFICE_IDS = ["office-jaipur", "office-delhi", "office-lucknow", "office-kanpur"];
const DEMO_MANAGER_EMAILS = ["jaipur@blueroute.in", "delhi@blueroute.in"];
const DEMO_SUPER_ADMIN_EMAIL = "admin@blueroute.in";

// Exact (description, amount) pairs seed.ts created — Expense has no shipment
// link and no fixed id, so this is the only reliable match.
const DEMO_EXPENSES: { description: string; amount: number }[] = [
  { description: "Diesel for delivery vehicles", amount: 3500 },
  { description: "Driver salary - June", amount: 15000 },
  { description: "Office rent - June", amount: 8000 },
  { description: "Loading charges at Jaipur depot", amount: 1200 },
  { description: "Train booking fees", amount: 500 },
];

async function main() {
  // ── SECTION A — demo transactional data (low risk) ──────────────────────
  // Tracking events, payments, ledger entries tied to the 5 demo shipments.
  await prisma.trackingEvent.deleteMany({ where: { shipmentId: { in: DEMO_SHIPMENT_IDS } } });
  await prisma.payment.deleteMany({ where: { shipmentId: { in: DEMO_SHIPMENT_IDS } } });
  await prisma.ledgerEntry.deleteMany({ where: { shipmentId: { in: DEMO_SHIPMENT_IDS } } });

  // The 2 demo payments/1 ledger-less payment that reference a demo customer
  // but no shipment (the "advance payment" row in seed.ts).
  await prisma.payment.deleteMany({ where: { customerId: { in: DEMO_CUSTOMER_IDS } } });
  await prisma.ledgerEntry.deleteMany({ where: { customerId: { in: DEMO_CUSTOMER_IDS } } });

  await prisma.shipment.deleteMany({ where: { id: { in: DEMO_SHIPMENT_IDS } } });
  await prisma.trainManifest.deleteMany({ where: { id: { in: DEMO_MANIFEST_IDS } } });
  await prisma.customer.deleteMany({ where: { id: { in: DEMO_CUSTOMER_IDS } } });
  await prisma.deliveryPartner.deleteMany({ where: { id: { in: DEMO_DELIVERY_PARTNER_IDS } } });

  for (const e of DEMO_EXPENSES) {
    await prisma.expense.deleteMany({ where: { description: e.description, amount: e.amount } });
  }

  // ── SECTION B — demo office-manager accounts (HIGHER RISK — confirm first) ─
  // Only run if Ramesh Sharma / Suresh Gupta are NOT real employee logins.
  // await prisma.auditLog.deleteMany({ where: { user: { email: { in: DEMO_MANAGER_EMAILS } } } });
  // await prisma.user.deleteMany({ where: { email: { in: DEMO_MANAGER_EMAILS } } });

  // ── SECTION C — demo offices (NOT RECOMMENDED by default) ────────────────
  // Jaipur/Delhi/Lucknow/Kanpur are plausibly still the real operating
  // offices. Deleting will FAIL anyway (FK restrict) if any real shipment,
  // expense, or user still references them — which is a safety net, not a
  // reason to force it through.
  // await prisma.office.deleteMany({ where: { id: { in: DEMO_OFFICE_IDS } } });

  // ── SECTION D — Super Admin email mismatch — DO NOT RUN AS-IS ────────────
  // Requirement said keep only admin@blueroutelogistics.in, but seed.ts created
  // admin@blueroute.in. These are two different email addresses. Confirm
  // which is correct before touching the Super Admin row — see note below.
  // await prisma.user.update({
  //   where: { email: DEMO_SUPER_ADMIN_EMAIL },
  //   data: { email: "admin@blueroutelogistics.in" },
  // });

  console.log("Done (only uncommented sections executed).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
