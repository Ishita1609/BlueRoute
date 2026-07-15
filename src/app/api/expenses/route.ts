import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const expense = await prisma.expense.create({
    data: {
      date: new Date(body.date),
      category: body.category,
      amount: parseFloat(body.amount),
      description: body.description || null,
      officeId: body.officeId || null,
      paidTo: body.paidTo || null,
      billNumber: body.billNumber || null,
      remarks: body.remarks || null,
    },
  });

  return NextResponse.json(expense);
}
