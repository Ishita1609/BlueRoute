import { prisma } from "@/lib/prisma";
import { DeliveryPartnersClient } from "@/components/delivery-partners/DeliveryPartnersClient";

export default async function DeliveryPartnersPage() {
  const partners = await prisma.deliveryPartner.findMany({
    include: {
      _count: { select: { shipments: true } },
    },
    orderBy: { name: "asc" },
  });

  return <DeliveryPartnersClient partners={JSON.parse(JSON.stringify(partners))} />;
}
