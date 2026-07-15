import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function sanitize(user: any) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const old = await prisma.user.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Super Admin accounts are protected: no role change, no deactivation.
  if (old.role === "SUPER_ADMIN") {
    if (body.role !== undefined && body.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot change the role of a Super Admin account." }, { status: 403 });
    }
    if (body.isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate a Super Admin account." }, { status: 403 });
    }
  }

  const data: Record<string, any> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.officeId !== undefined) data.officeId = body.officeId || null;
  if (body.role !== undefined) data.role = body.role;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  if (body.newPassword !== undefined) {
    if (!PASSWORD_POLICY.test(body.newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number." },
        { status: 400 }
      );
    }
    data.password = await bcrypt.hash(body.newPassword, 12);
  }

  const user = await prisma.user.update({ where: { id }, data });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      oldValue: sanitize(old) as any,
      newValue: sanitize(user) as any,
    },
  });

  return NextResponse.json(sanitize(user));
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

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot delete a Super Admin account." }, { status: 403 });
  }

  // Shipment/Customer/Payment/LedgerEntry have no ownership link to a User in
  // this schema, so the only real, checkable relation is AuditLog (a required
  // FK — every logged action this user has ever performed blocks deletion).
  const auditLogCount = await prisma.auditLog.count({ where: { userId: id } });

  if (auditLogCount > 0) {
    return NextResponse.json(
      {
        error: "This user owns historical business records and cannot be deleted.",
        blockers: [{ type: "auditLogs", label: "audit log entries", count: auditLogCount }],
        suggestion: "Deactivate the account instead.",
      },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "User",
      entityId: id,
      oldValue: sanitize(user) as any,
    },
  });

  return NextResponse.json({ success: true });
}
