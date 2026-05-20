import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdvisor, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encrypt";
import { writeAuditLog } from "@/lib/audit";

const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  crmId: z.string().optional(),
  crmVendor: z.enum(["wealthbox", "redtail", "orion"]).optional(),
});

export async function GET(req: Request) {
  let advisorId: string, firmId: string;
  try {
    ({ advisorId, firmId } = await requireAdvisor());
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: 401 });
    }
    throw err;
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const clients = await db.client.findMany({
    where: { firmId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, crmVendor: true, createdAt: true },
  });

  await writeAuditLog({ actorId: advisorId, action: "list", resourceType: "Client", resourceId: "*", ip, firmId });

  return NextResponse.json({ data: clients });
}

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
  const parsed = CreateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const client = await db.client.create({
    data: {
      firmId,
      advisorId,
      name: parsed.data.name,
      emailEnc: encrypt(parsed.data.email),
      phoneEnc: encrypt(parsed.data.phone),
      crmId: parsed.data.crmId,
      crmVendor: parsed.data.crmVendor,
    },
  });

  await writeAuditLog({ actorId: advisorId, action: "create", resourceType: "Client", resourceId: client.id, ip, firmId });

  return NextResponse.json({ data: { id: client.id, name: client.name } }, { status: 201 });
}
