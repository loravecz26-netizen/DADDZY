import { db } from "@/lib/db";

export interface AuditEntry {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ip: string;
  firmId: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({ data: entry });
  } catch (err) {
    console.error("[audit] failed to write audit log", { entry, err });
  }
}
