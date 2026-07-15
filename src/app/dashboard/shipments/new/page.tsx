import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewShipmentForm } from "@/components/shipments/NewShipmentForm";

export default async function NewShipmentPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const officeId = (session?.user as any)?.officeId;

  const [customers, offices] = await Promise.all([
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.office.findMany({ where: { isActive: true }, orderBy: { city: "asc" } }),
  ]);

  return (
    <NewShipmentForm
      customers={JSON.parse(JSON.stringify(customers))}
      offices={JSON.parse(JSON.stringify(offices))}
      userOfficeId={officeId}
      role={role}
    />
  );
}
