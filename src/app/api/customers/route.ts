import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || null,
      gstNumber: body.gstNumber || null,
      defaultRateRoad: parseFloat(body.defaultRateRoad) || 0,
      defaultRateTrain: parseFloat(body.defaultRateTrain) || 0,
      defaultRateAir: parseFloat(body.defaultRateAir) || 0,
      creditLimit: parseFloat(body.creditLimit) || 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "Customer",
      entityId: customer.id,
      newValue: customer as any,
    },
  });

  return NextResponse.json(customer);
}
