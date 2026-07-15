import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get("number");

  if (!number) return NextResponse.json({ error: "Tracking number required" }, { status: 400 });

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: number },
    include: {
      customer: { select: { name: true, phone: true } },
      trackingEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(shipment);
}
