import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildExpenseWhere, buildExpenseOrderBy } from "@/lib/expense-filters";
import { formatDate, getExpenseCategoryLabel } from "@/lib/utils";

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userOfficeId = (session.user as any).officeId;

  const url = new URL(req.url);
  const sp = {
    category: url.searchParams.get("category") ?? undefined,
    officeId: url.searchParams.get("officeId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortDir: url.searchParams.get("sortDir") ?? undefined,
  };

  // Same filter/sort logic the Expenses page itself uses — no separate query path.
  const where = buildExpenseWhere(sp, role, userOfficeId);
  const orderBy = buildExpenseOrderBy(sp);

  const expenses = await prisma.expense.findMany({
    where,
    include: { office: true },
    orderBy,
    // No skip/take — export is the full filtered set, not just the current page.
  });

  const headers = ["Date", "Category", "Amount", "Office", "Paid To", "Description", "Bill Number", "Remarks"];
  const lines = [
    headers.join(","),
    ...expenses.map((e) =>
      [
        formatDate(e.date),
        getExpenseCategoryLabel(e.category),
        e.amount.toFixed(2),
        e.office?.city ?? "",
        e.paidTo ?? "",
        e.description ?? "",
        e.billNumber ?? "",
        e.remarks ?? "",
      ]
        .map((v) => escapeCsvValue(String(v)))
        .join(",")
    ),
  ];
  // Leading BOM so Excel reliably detects UTF-8 instead of misreading the file.
  const csvContent = "﻿" + lines.join("\r\n");

  // Build a meaningful filename from whichever filters are actually active.
  const filenameParts = ["expenses"];
  if (sp.officeId) {
    const office = await prisma.office.findUnique({ where: { id: sp.officeId } });
    if (office) filenameParts.push(slugify(office.city));
  }
  if (sp.category) {
    filenameParts.push(slugify(getExpenseCategoryLabel(sp.category)));
  }

  const today = new Date();
  if (sp.from && sp.to) {
    const from = new Date(sp.from);
    const to = new Date(sp.to);
    if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
      filenameParts.push(`${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`);
    } else if (from.getFullYear() === to.getFullYear()) {
      filenameParts.push(String(from.getFullYear()));
    } else {
      filenameParts.push(today.toISOString().slice(0, 10));
    }
  } else if (sp.from || sp.to) {
    const only = new Date((sp.from ?? sp.to) as string);
    filenameParts.push(`${only.getFullYear()}-${String(only.getMonth() + 1).padStart(2, "0")}`);
  } else {
    filenameParts.push(today.toISOString().slice(0, 10));
  }

  const filename = `${filenameParts.join("-")}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
