import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const [
    users,
    sessions,
    offices,
    customers,
    shipments,
    trainManifests,
    trackingEvents,
    deliveryPartners,
    payments,
    ledgerEntries,
    expenses,
    auditLogs,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.session.findMany(),
    prisma.office.findMany(),
    prisma.customer.findMany(),
    prisma.shipment.findMany(),
    prisma.trainManifest.findMany(),
    prisma.trackingEvent.findMany(),
    prisma.deliveryPartner.findMany(),
    prisma.payment.findMany(),
    prisma.ledgerEntry.findMany(),
    prisma.expense.findMany(),
    prisma.auditLog.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      sessions: sessions.length,
      offices: offices.length,
      customers: customers.length,
      shipments: shipments.length,
      trainManifests: trainManifests.length,
      trackingEvents: trackingEvents.length,
      deliveryPartners: deliveryPartners.length,
      payments: payments.length,
      ledgerEntries: ledgerEntries.length,
      expenses: expenses.length,
      auditLogs: auditLogs.length,
    },
    data: {
      users,
      sessions,
      offices,
      customers,
      shipments,
      trainManifests,
      trackingEvents,
      deliveryPartners,
      payments,
      ledgerEntries,
      expenses,
      auditLogs,
    },
  };

  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(dir, `backup-${stamp}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify(backup, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2)
  );

  console.log("BACKUP_FILE:" + file);
  console.log("COUNTS:" + JSON.stringify(backup.counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
