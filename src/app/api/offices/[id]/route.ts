import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const old = await prisma.office.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "Office not found" }, { status: 404 });

  const office = await prisma.office.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.address !== undefined ? { address: body.address || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "Office",
      entityId: id,
      oldValue: old as any,
      newValue: office as any,
    },
  });

  return NextResponse.json(office);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const office = await prisma.office.findUnique({ where: { id } });
  if (!office) return NextResponse.json({ error: "Office not found" }, { status: 404 });

  // Customer/Payment/LedgerEntry aren't directly scoped to an office in this
  // schema — they're only reachable through the office's shipments, so that's
  // the only meaningful way to check "related customers/payments/ledger entries".
  const [employees, shipments, expenses, manifests, customers, payments, ledgerEntries] =
    await Promise.all([
      prisma.user.count({ where: { officeId: id } }),
      prisma.shipment.count({ where: { officeId: id } }),
      prisma.expense.count({ where: { officeId: id } }),
      prisma.trainManifest.count({ where: { officeId: id } }),
      prisma.customer.count({ where: { shipments: { some: { officeId: id } } } }),
      prisma.payment.count({ where: { shipment: { officeId: id } } }),
      prisma.ledgerEntry.count({ where: { shipment: { officeId: id } } }),
    ]);

  const blockers = [
    { type: "employees", label: "employee accounts", count: employees },
    { type: "shipments", label: "shipments", count: shipments },
    { type: "expenses", label: "recorded expenses", count: expenses },
    { type: "manifests", label: "train manifests", count: manifests },
    { type: "customers", label: "customers with shipments through this office", count: customers },
    { type: "payments", label: "payments tied to this office's shipments", count: payments },
    { type: "ledgerEntries", label: "ledger entries tied to this office's shipments", count: ledgerEntries },
  ].filter((b) => b.count > 0);

  if (blockers.length > 0) {
    return NextResponse.json(
      {
        error: "This office has related data and cannot be deleted.",
        blockers,
        suggestion: "Deactivate the office instead to hide it from the website and new operations while keeping its history intact.",
      },
      { status: 409 }
    );
  }

  await prisma.office.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "Office",
      entityId: id,
      oldValue: office as any,
    },
  });

  return NextResponse.json({ success: true });
}
