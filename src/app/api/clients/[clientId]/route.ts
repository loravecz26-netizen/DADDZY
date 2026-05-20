import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdvisor, canAdvisorAccessClient, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encrypt";
import { writeAuditLog } from "@/lib/audit";

const PatchClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
});

async function authorizeClientAccess(advisorId: string, clientId: string) {
  const allowed = await canAdvisorAccessClient(advisorId, clientId);
  if (!allowed) throw new AuthError("Client not found", 403);
}

export async function GET(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  let advisorId: string, firmId: string;
  try {
    ({ advisorId, firmId } = await requireAdvisor());
    await authorizeClientAccess(advisorId, params.clientId);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: err.status });
    }
    throw err;
  }

  const client = await db.client.findFirst({
    where: { id: params.clientId, deletedAt: null },
  });
  if (!client) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Client not found" } }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  await writeAuditLog({ actorId: advisorId, action: "read", resourceType: "Client", resourceId: client.id, ip, firmId });

  return NextResponse.json({
    data: {
      id: client.id,
      name: client.name,
      email: decrypt(client.emailEnc),
      phone: decrypt(client.phoneEnc),
      crmVendor: client.crmVendor,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  let advisorId: string, firmId: string;
  try {
    ({ advisorId, firmId } = await requireAdvisor());
    await authorizeClientAccess(advisorId, params.clientId);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: err.status });
    }
    throw err;
  }

  const body: unknown = await req.json();
  const parsed = PatchClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid input" } }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const updates: Record<string, unknown> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.email) updates.emailEnc = encrypt(parsed.data.email);
  if (parsed.data.phone) updates.phoneEnc = encrypt(parsed.data.phone);

  const client = await db.client.update({
    where: { id: params.clientId },
    data: updates,
  });

  await writeAuditLog({ actorId: advisorId, action: "update", resourceType: "Client", resourceId: client.id, ip, firmId });

  return NextResponse.json({ data: { id: client.id, name: client.name } });
}

export async function DELETE(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  let advisorId: string, firmId: string;
  try {
    ({ advisorId, firmId } = await requireAdvisor());
    await authorizeClientAccess(advisorId, params.clientId);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: err.status });
    }
    throw err;
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  await db.client.update({
    where: { id: params.clientId },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({ actorId: advisorId, action: "delete", resourceType: "Client", resourceId: params.clientId, ip, firmId });

  return new NextResponse(null, { status: 204 });
}
