import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAdvisor(): Promise<{ advisorId: string; firmId: string }> {
  const { userId } = await auth();
  if (!userId) throw new AuthError("Unauthenticated");

  const advisor = await db.advisor.findUnique({ where: { clerkUserId: userId } });
  if (!advisor) throw new AuthError("Advisor not found");

  return { advisorId: advisor.id, firmId: advisor.firmId };
}

export async function canAdvisorAccessClient(
  advisorId: string,
  clientId: string
): Promise<boolean> {
  const advisor = await db.advisor.findUnique({ where: { id: advisorId } });
  if (!advisor) return false;

  const client = await db.client.findFirst({
    where: { id: clientId, firmId: advisor.firmId, deletedAt: null },
  });
  return client !== null;
}
