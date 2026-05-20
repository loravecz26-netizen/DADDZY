import { requireAdvisor } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MessagesPage() {
  const { advisorId } = await requireAdvisor();

  const threads = await db.message.groupBy({
    by: ["threadId", "clientId"],
    where: { advisorId },
    _count: { id: true },
    _max: { sentAt: true },
    orderBy: { _max: { sentAt: "desc" } },
    take: 20,
  });

  const clientIds = [...new Set(threads.map((t) => t.clientId))];
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });
  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">SMS threads with your clients.</p>
      </div>

      <div className="space-y-3">
        {threads.length === 0 && (
          <p className="text-sm text-muted-foreground">No message threads yet.</p>
        )}
        {threads.map((thread) => (
          <Card key={thread.threadId}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {clientMap.get(thread.clientId) ?? "Unknown Client"}
              </CardTitle>
              <Badge variant="outline">{thread._count.id} messages</Badge>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Last:{" "}
              {thread._max.sentAt
                ? new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(thread._max.sentAt)
                : "—"}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
