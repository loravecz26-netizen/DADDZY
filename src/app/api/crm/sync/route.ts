import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdvisor, AuthError } from "@/lib/auth";
import { getCrmAdapter, type CrmVendor } from "@/lib/crm/index";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encrypt";
import { writeAuditLog } from "@/lib/audit";

const BodySchema = z.object({
  vendor: z.enum(["wealthbox", "redtail", "orion"]),
});

export async function POST(req: Request) {
  let advisorId: string, firmId: string;
  try {
    ({ advisorId, firmId } = await requireAdvisor());
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: 401 });
    }
    throw err;
  }

  const body: unknown = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid input" } }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const adapter = getCrmAdapter(parsed.data.vendor as CrmVendor, advisorId);

  let contacts;
  try {
    contacts = await adapter.listContacts();
  } catch (err) {
    console.error("[crm/sync] fetch failed", { advisorId, vendor: parsed.data.vendor, err });
    return NextResponse.json(
      { error: { code: "CRM_ERROR", message: "Failed to fetch contacts from CRM" } },
      { status: 502 }
    );
  }

  let synced = 0;
  for (const contact of contacts) {
    await db.client.upsert({
      where: {
        // Unique on (firmId + crmId + crmVendor) — in prod, add a @@unique to schema
        id: `crm:${parsed.data.vendor}:${contact.id}`,
      },
      create: {
        id: `crm:${parsed.data.vendor}:${contact.id}`,
        firmId,
        advisorId,
        name: `${contact.firstName} ${contact.lastName}`,
        emailEnc: encrypt(contact.email ?? ""),
        phoneEnc: encrypt(contact.phone ?? ""),
        crmId: contact.id,
        crmVendor: parsed.data.vendor,
      },
      update: {
        name: `${contact.firstName} ${contact.lastName}`,
        emailEnc: encrypt(contact.email ?? ""),
        phoneEnc: encrypt(contact.phone ?? ""),
      },
    });
    synced++;
  }

  await writeAuditLog({
    actorId: advisorId,
    action: "crm_sync",
    resourceType: "Client",
    resourceId: "*",
    ip,
    firmId,
  });

  return NextResponse.json({ data: { synced, vendor: parsed.data.vendor } });
}
