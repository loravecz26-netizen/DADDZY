import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ClientRow {
  id: string;
  name: string;
  crmVendor: string | null;
  lastMessageAt: Date | null;
}

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>CRM</TableHead>
          <TableHead>Last Contact</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No clients yet.
            </TableCell>
          </TableRow>
        )}
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>
              {client.crmVendor ? (
                <Badge variant="secondary" className="capitalize">
                  {client.crmVendor}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {client.lastMessageAt
                ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                    client.lastMessageAt
                  )
                : "—"}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dashboard/clients/${client.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
