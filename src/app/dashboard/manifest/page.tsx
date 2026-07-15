import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ManifestClient } from "@/components/manifest/ManifestClient";

export default async function ManifestPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; officeId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userOfficeId = (session?.user as any)?.officeId;

  const sp = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const filterDate = sp.date ?? today;
  const filterOffice = sp.officeId ?? (role !== "SUPER_ADMIN" ? userOfficeId : "");

  const startDate = new Date(filterDate);
  const endDate = new Date(filterDate + "T23:59:59");

  const where: any = {
    date: { gte: startDate, lte: endDate },
    ...(filterOffice ? { officeId: filterOffice } : {}),
  };

  const [manifests, trainShipments, offices] = await Promise.all([
    prisma.trainManifest.findMany({
      where,
      include: { office: true, shipments: { include: { customer: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shipment.findMany({
      where: {
        mode: "TRAIN",
        date: { gte: startDate, lte: endDate },
        ...(filterOffice ? { officeId: filterOffice } : {}),
      },
      include: { customer: true, office: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.office.findMany({ where: { isActive: true } }),
  ]);

  return (
    <ManifestClient
      manifests={JSON.parse(JSON.stringify(manifests))}
      trainShipments={JSON.parse(JSON.stringify(trainShipments))}
      offices={JSON.parse(JSON.stringify(offices))}
      filterDate={filterDate}
      filterOffice={filterOffice ?? ""}
      role={role}
    />
  );
}
