import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const office = await prisma.office.create({
    data: {
      name: body.name,
      city: body.city,
      address: body.address || null,
      phone: body.phone || null,
      email: body.email || null,
    },
  });

  return NextResponse.json(office);
}
