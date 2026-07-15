import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!PASSWORD_POLICY.test(body.password ?? "")) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
      officeId: body.officeId || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    },
  });

  const { password: _, ...safeUser } = user;

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newValue: safeUser as any,
    },
  });

  return NextResponse.json(safeUser);
}
