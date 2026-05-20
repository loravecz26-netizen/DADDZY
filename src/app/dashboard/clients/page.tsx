import { Suspense } from "react";
import { requireAdvisor } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClientTable } from "@/components/clients/client-table";
import { ClientsLoading } from "./loading";

async function ClientList({ advisorId, firmId }: { advisorId: string; firmId: string }) {
  const clients = await db.client.findMany({
    where: { firmId, deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        select: { sentAt: true },
      },
    },
  });

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    crmVendor: c.crmVendor,
    lastMessageAt: c.messages[0]?.sentAt ?? null,
  }));

  return <ClientTable clients={rows} />;
}

export default async function ClientsPage() {
  const { advisorId, firmId } = await requireAdvisor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-muted-foreground">Your full book of business.</p>
      </div>
      <Suspense fallback={<ClientsLoading />}>
        <ClientList advisorId={advisorId} firmId={firmId} />
      </Suspense>
    </div>
  );
}
