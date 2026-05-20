import { requireAdvisor } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Activity } from "lucide-react";

async function getStats(advisorId: string, firmId: string) {
  const [totalClients, messagesToday, activeThreads] = await Promise.all([
    db.client.count({ where: { firmId, deletedAt: null } }),
    db.message.count({
      where: {
        advisorId,
        loggedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    db.message.groupBy({
      by: ["threadId"],
      where: { advisorId },
      _count: true,
    }),
  ]);

  return { totalClients, messagesToday, activeThreads: activeThreads.length };
}

export default async function DashboardPage() {
  const { advisorId, firmId } = await requireAdvisor();
  const stats = await getStats(advisorId, firmId);

  const statCards = [
    { label: "Total Clients", value: stats.totalClients, icon: Users },
    { label: "Messages Today", value: stats.messagesToday, icon: MessageSquare },
    { label: "Active Threads", value: stats.activeThreads, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Your advisory dashboard at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
