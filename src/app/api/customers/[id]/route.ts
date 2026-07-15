import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const old = await prisma.customer.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.address !== undefined ? { address: body.address || null } : {}),
      ...(body.city !== undefined ? { city: body.city || null } : {}),
      ...(body.gstNumber !== undefined ? { gstNumber: body.gstNumber || null } : {}),
      ...(body.defaultRateRoad !== undefined ? { defaultRateRoad: parseFloat(body.defaultRateRoad) || 0 } : {}),
      ...(body.defaultRateTrain !== undefined ? { defaultRateTrain: parseFloat(body.defaultRateTrain) || 0 } : {}),
      ...(body.defaultRateAir !== undefined ? { defaultRateAir: parseFloat(body.defaultRateAir) || 0 } : {}),
      ...(body.creditLimit !== undefined ? { creditLimit: parseFloat(body.creditLimit) || 0 } : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "Customer",
      entityId: id,
      oldValue: old as any,
      newValue: customer as any,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const [shipmentCount, paymentCount, ledgerCount, shipmentTotal, paymentTotal] = await Promise.all([
    prisma.shipment.count({ where: { customerId: id } }),
    prisma.payment.count({ where: { customerId: id } }),
    prisma.ledgerEntry.count({ where: { customerId: id } }),
    prisma.shipment.aggregate({ where: { customerId: id }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { customerId: id }, _sum: { amount: true } }),
  ]);

  if (shipmentCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete this customer — ${shipmentCount} shipment${shipmentCount === 1 ? "" : "s"} are linked to their account.` },
      { status: 409 }
    );
  }

  const outstandingBalance = (shipmentTotal._sum.amount ?? 0) - (paymentTotal._sum.amount ?? 0);
  if (outstandingBalance !== 0) {
    return NextResponse.json(
      { error: `Cannot delete this customer — they have an outstanding balance of ₹${outstandingBalance.toFixed(2)}.` },
      { status: 409 }
    );
  }

  if (paymentCount > 0 || ledgerCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete this customer — they have payment or ledger history on record." },
      { status: 409 }
    );
  }

  await prisma.customer.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "Customer",
      entityId: id,
      oldValue: customer as any,
    },
  });

  return NextResponse.json({ success: true });
}
