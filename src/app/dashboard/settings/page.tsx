import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/dashboard");

  const [offices, users] = await Promise.all([
    prisma.office.findMany({ orderBy: { city: "asc" } }),
    prisma.user.findMany({ include: { office: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <SettingsClient
      offices={JSON.parse(JSON.stringify(offices))}
      users={JSON.parse(JSON.stringify(users))}
    />
  );
}
