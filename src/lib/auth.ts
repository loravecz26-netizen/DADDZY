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

const IS_DEMO = process.env.DEMO_MODE === "true";

const DEMO_ADVISOR = { advisorId: "demo-advisor", firmId: "demo-firm" };

export async function requireAdvisor(): Promise<{ advisorId: string; firmId: string }> {
  if (IS_DEMO) return DEMO_ADVISOR;

  const { auth } = await import("@clerk/nextjs/server");
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
  if (IS_DEMO) return true;

  const advisor = await db.advisor.findUnique({ where: { id: advisorId } });
  if (!advisor) return false;

  const client = await db.client.findFirst({
    where: { id: clientId, firmId: advisor.firmId, deletedAt: null },
  });
  return client !== null;
}
