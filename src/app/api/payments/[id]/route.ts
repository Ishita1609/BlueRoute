import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateCustomerLedger } from "@/lib/ledger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const old = await prisma.payment.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const ledgerRelevantChange =
    body.customerId !== undefined || body.amount !== undefined || body.date !== undefined || body.remarks !== undefined;

  const payment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: {
        ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
        ...(body.customerId !== undefined ? { customerId: body.customerId } : {}),
        ...(body.amount !== undefined ? { amount: parseFloat(body.amount) } : {}),
        ...(body.mode !== undefined ? { mode: body.mode } : {}),
        ...(body.referenceNo !== undefined ? { referenceNo: body.referenceNo || null } : {}),
        ...(body.remarks !== undefined ? { remarks: body.remarks || null } : {}),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "Payment",
        entityId: id,
        oldValue: old as any,
        newValue: updated as any,
      },
    });

    if (ledgerRelevantChange) {
      const linkedEntry = await tx.ledgerEntry.findUnique({ where: { paymentId: id } });
      if (linkedEntry) {
        const customerChanged = body.customerId !== undefined && body.customerId !== old.customerId;

        await tx.ledgerEntry.update({
          where: { id: linkedEntry.id },
          data: {
            ...(body.customerId !== undefined ? { customerId: body.customerId } : {}),
            ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
            ...(body.amount !== undefined
              ? { amount: parseFloat(body.amount), paymentReceived: parseFloat(body.amount) }
              : {}),
            ...(body.remarks !== undefined ? { remarks: body.remarks || null } : {}),
          },
        });

        await recalculateCustomerLedger(tx, old.customerId);
        if (customerChanged) {
          await recalculateCustomerLedger(tx, updated.customerId);
        }
      }
    }

    return updated;
  });

  return NextResponse.json(payment);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.ledgerEntry.deleteMany({ where: { paymentId: id } });
    await tx.payment.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE",
        entity: "Payment",
        entityId: id,
        oldValue: payment as any,
      },
    });

    await recalculateCustomerLedger(tx, payment.customerId);
  });

  return NextResponse.json({ success: true });
}
