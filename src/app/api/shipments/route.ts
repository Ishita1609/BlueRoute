import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTrackingNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;

  const shipments = await prisma.shipment.findMany({
    include: { customer: true, office: true },
    orderBy: { date: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return NextResponse.json(shipments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber: generateTrackingNumber(),
      date: new Date(body.date),
      customerId: body.customerId,
      officeId: body.officeId,
      mode: body.mode,
      packets: parseInt(body.packets),
      weight: parseFloat(body.weight),
      rate: parseFloat(body.rate),
      amount: parseFloat(body.amount),
      fromCity: body.fromCity,
      toCity: body.toCity,
      description: body.description || null,
      remarks: body.remarks || null,
      status: "BOOKED",
    },
  });

  // Create tracking event
  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: "BOOKED",
      location: body.fromCity,
      description: "Shipment booked",
      createdBy: session.user?.name ?? undefined,
    },
  });

  // Create ledger entry
  const lastEntry = await prisma.ledgerEntry.findFirst({
    where: { customerId: body.customerId },
    orderBy: { createdAt: "desc" },
  });
  const prevBalance = lastEntry?.runningBalance ?? 0;

  await prisma.ledgerEntry.create({
    data: {
      date: new Date(body.date),
      customerId: body.customerId,
      shipmentId: shipment.id,
      type: "SHIPMENT",
      pieces: parseInt(body.packets),
      weight: parseFloat(body.weight),
      rate: parseFloat(body.rate),
      amount: parseFloat(body.amount),
      paymentReceived: 0,
      runningBalance: prevBalance + parseFloat(body.amount),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "Shipment",
      entityId: shipment.id,
      newValue: shipment as any,
    },
  });

  return NextResponse.json(shipment);
}
