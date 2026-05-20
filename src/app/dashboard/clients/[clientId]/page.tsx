import { notFound } from "next/navigation";
import { requireAdvisor, canAdvisorAccessClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { writeAuditLog } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function ClientDetailPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { advisorId, firmId } = await requireAdvisor();
  const allowed = await canAdvisorAccessClient(advisorId, params.clientId);
  if (!allowed) notFound();

  const client = await db.client.findFirst({
    where: { id: params.clientId, deletedAt: null },
    include: {
      messages: {
        orderBy: { sentAt: "desc" },
        take: 10,
      },
    },
  });
  if (!client) notFound();

  await writeAuditLog({
    actorId: advisorId,
    action: "read",
    resourceType: "Client",
    resourceId: client.id,
    ip: "server",
    firmId,
  });

  const email = decrypt(client.emailEnc);
  const phone = decrypt(client.phoneEnc);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {client.crmVendor && (
          <Badge variant="secondary" className="mt-1 capitalize">
            {client.crmVendor}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="w-16 text-muted-foreground">Email</span>
            <span>{email}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 text-muted-foreground">Phone</span>
            <span>{phone}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.messages.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          )}
          {client.messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{msg.direction}</Badge>
                <Badge variant="outline">{msg.channel}</Badge>
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(msg.sentAt)}
                </span>
              </div>
              <p className="text-sm">{msg.body}</p>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
