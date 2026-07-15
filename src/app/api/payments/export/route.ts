import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentWhere, buildPaymentOrderBy } from "@/lib/payment-filters";
import { formatDate, getPaymentModeLabel } from "@/lib/utils";

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const sp = {
    customerId: url.searchParams.get("customerId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortDir: url.searchParams.get("sortDir") ?? undefined,
  };

  // Same filter/sort logic the Payments page itself uses — no separate query path.
  const where = buildPaymentWhere(sp);
  const orderBy = buildPaymentOrderBy(sp);

  const payments = await prisma.payment.findMany({
    where,
    include: { customer: true },
    orderBy,
    // No skip/take — export is the full filtered set, not just the current page.
  });

  const headers = ["Date", "Customer", "Amount", "Payment Mode", "Reference Number", "Remarks"];
  const lines = [
    headers.join(","),
    ...payments.map((p) =>
      [
        formatDate(p.date),
        p.customer?.name ?? "",
        p.amount.toFixed(2),
        getPaymentModeLabel(p.mode),
        p.referenceNo ?? "",
        p.remarks ?? "",
      ]
        .map((v) => escapeCsvValue(String(v)))
        .join(",")
    ),
  ];
  // Leading BOM so Excel reliably detects UTF-8 instead of misreading the file.
  const csvContent = "﻿" + lines.join("\r\n");

  const filename = `Payments_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
