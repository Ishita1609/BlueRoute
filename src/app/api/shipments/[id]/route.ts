import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateCustomerLedger } from "@/lib/ledger";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      customer: true,
      office: true,
      deliveryPartner: true,
      trackingEvents: { orderBy: { timestamp: "desc" } },
      payments: true,
    },
  });

  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const old = await prisma.shipment.findUnique({ where: { id } });

  const shipment = await prisma.shipment.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.deliveryPartnerId !== undefined ? { deliveryPartnerId: body.deliveryPartnerId } : {}),
      ...(body.remarks !== undefined ? { remarks: body.remarks } : {}),
      ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
      ...(body.mode !== undefined ? { mode: body.mode } : {}),
      ...(body.packets !== undefined ? { packets: parseInt(body.packets) } : {}),
      ...(body.weight !== undefined ? { weight: parseFloat(body.weight) } : {}),
      ...(body.rate !== undefined ? { rate: parseFloat(body.rate) } : {}),
      ...(body.amount !== undefined ? { amount: parseFloat(body.amount) } : {}),
      ...(body.fromCity !== undefined ? { fromCity: body.fromCity } : {}),
      ...(body.toCity !== undefined ? { toCity: body.toCity } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
    },
  });

  if (body.status && body.status !== old?.status) {
    await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status: body.status,
        location: body.location ?? "",
        description: body.description ?? `Status updated to ${body.status}`,
        createdBy: session.user?.name ?? undefined,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "Shipment",
      entityId: id,
      oldValue: old as any,
      newValue: shipment as any,
    },
  });

  return NextResponse.json(shipment);
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

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const linkedPayments = await tx.payment.findMany({ where: { shipmentId: id }, select: { id: true } });
    const linkedPaymentIds = linkedPayments.map((p) => p.id);

    await tx.trackingEvent.deleteMany({ where: { shipmentId: id } });
    // The shipment's own SHIPMENT-type ledger entry (linked via shipmentId).
    await tx.ledgerEntry.deleteMany({ where: { shipmentId: id } });
    // Ledger entries created by any payments recorded against this shipment.
    if (linkedPaymentIds.length > 0) {
      await tx.ledgerEntry.deleteMany({ where: { paymentId: { in: linkedPaymentIds } } });
    }
    await tx.payment.deleteMany({ where: { shipmentId: id } });
    await tx.shipment.delete({ where: { id } });

    await recalculateCustomerLedger(tx, shipment.customerId);
  });

  return NextResponse.json({ success: true });
}
