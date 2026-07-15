import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partners = await prisma.deliveryPartner.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const partner = await prisma.deliveryPartner.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      vehicleNo: body.vehicleNo || null,
      area: body.area || null,
    },
  });

  return NextResponse.json(partner);
}
