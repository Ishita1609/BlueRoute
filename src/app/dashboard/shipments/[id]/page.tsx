import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShipmentDetailClient } from "@/components/shipments/ShipmentDetailClient";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [shipment, deliveryPartners] = await Promise.all([
    prisma.shipment.findUnique({
      where: { id },
      include: {
        customer: true,
        office: true,
        deliveryPartner: true,
        trackingEvents: { orderBy: { timestamp: "asc" } },
        payments: true,
      },
    }),
    prisma.deliveryPartner.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!shipment) notFound();

  return (
    <ShipmentDetailClient
      shipment={JSON.parse(JSON.stringify(shipment))}
      deliveryPartners={JSON.parse(JSON.stringify(deliveryPartners))}
    />
  );
}
