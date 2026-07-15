import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentsClient } from "@/components/shipments/ShipmentsClient";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; mode?: string; status?: string; office?: string; page?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userOfficeId = (session?.user as any)?.officeId;

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {
    ...(role !== "SUPER_ADMIN" && userOfficeId ? { officeId: userOfficeId } : {}),
    ...(sp.mode ? { mode: sp.mode } : {}),
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.office && role === "SUPER_ADMIN" ? { officeId: sp.office } : {}),
    ...(sp.search
      ? {
          OR: [
            { trackingNumber: { contains: sp.search, mode: "insensitive" } },
            { customer: { name: { contains: sp.search, mode: "insensitive" } } },
            { fromCity: { contains: sp.search, mode: "insensitive" } },
            { toCity: { contains: sp.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [shipments, total, offices, modeBreakdown] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: { customer: true, office: true, deliveryPartner: true },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.shipment.count({ where }),
    prisma.office.findMany({ where: { isActive: true }, orderBy: { city: "asc" } }),
    prisma.shipment.groupBy({ by: ["mode"], where, _count: true, _sum: { amount: true } }),
  ]);

  return (
    <ShipmentsClient
      shipments={JSON.parse(JSON.stringify(shipments))}
      total={total}
      page={page}
      pageSize={pageSize}
      offices={JSON.parse(JSON.stringify(offices))}
      role={role}
      searchParams={sp}
      modeBreakdown={JSON.parse(JSON.stringify(modeBreakdown))}
    />
  );
}
