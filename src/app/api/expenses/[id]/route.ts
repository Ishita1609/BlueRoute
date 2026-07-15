import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userOfficeId = (session.user as any).officeId;
  const { id } = await params;
  const body = await req.json();

  const old = await prisma.expense.findUnique({ where: { id } });
  if (!old) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  // Office Managers may only manage expenses scoped to their own office —
  // mirrors the same office-scoping already enforced when listing expenses.
  if (role !== "SUPER_ADMIN" && old.officeId !== userOfficeId) {
    return NextResponse.json({ error: "You do not have permission to edit this expense." }, { status: 403 });
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.amount !== undefined ? { amount: parseFloat(body.amount) } : {}),
      ...(body.description !== undefined ? { description: body.description || null } : {}),
      ...(body.officeId !== undefined ? { officeId: body.officeId || null } : {}),
      ...(body.paidTo !== undefined ? { paidTo: body.paidTo || null } : {}),
      ...(body.billNumber !== undefined ? { billNumber: body.billNumber || null } : {}),
      ...(body.remarks !== undefined ? { remarks: body.remarks || null } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "Expense",
      entityId: id,
      oldValue: old as any,
      newValue: expense as any,
    },
  });

  return NextResponse.json(expense);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userOfficeId = (session.user as any).officeId;
  const { id } = await params;

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  if (role !== "SUPER_ADMIN" && expense.officeId !== userOfficeId) {
    return NextResponse.json({ error: "You do not have permission to delete this expense." }, { status: 403 });
  }

  await prisma.expense.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "Expense",
      entityId: id,
      oldValue: expense as any,
    },
  });

  return NextResponse.json({ success: true });
}
