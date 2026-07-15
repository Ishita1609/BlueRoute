import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const payment = await prisma.payment.create({
    data: {
      date: new Date(body.date),
      customerId: body.customerId,
      shipmentId: body.shipmentId || null,
      amount: parseFloat(body.amount),
      mode: body.mode,
      referenceNo: body.referenceNo || null,
      remarks: body.remarks || null,
    },
  });

  // Update ledger running balance
  const lastEntry = await prisma.ledgerEntry.findFirst({
    where: { customerId: body.customerId },
    orderBy: { createdAt: "desc" },
  });
  const prevBalance = lastEntry?.runningBalance ?? 0;

  await prisma.ledgerEntry.create({
    data: {
      date: new Date(body.date),
      customerId: body.customerId,
      paymentId: payment.id,
      type: "PAYMENT",
      amount: parseFloat(body.amount),
      paymentReceived: parseFloat(body.amount),
      runningBalance: prevBalance - parseFloat(body.amount),
      remarks: body.remarks || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "Payment",
      entityId: payment.id,
      newValue: payment as any,
    },
  });

  return NextResponse.json(payment);
}
