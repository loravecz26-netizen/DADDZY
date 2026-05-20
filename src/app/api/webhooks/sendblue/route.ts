import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

const WebhookBodySchema = z.object({
  message_handle: z.string(),
  content: z.string(),
  from_number: z.string(),
  to_number: z.string(),
  date: z.string(),
  was_downgraded: z.boolean().optional(),
  plan: z.string().optional(),
});

function verifySignature(payload: string, signature: string): boolean {
  const expected = createHmac("sha256", env.SENDBLUE_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-sendblue-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Invalid signature" } },
      { status: 403 }
    );
  }

  const body: unknown = JSON.parse(rawBody);
  const parsed = WebhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  // Enqueue async — no inline LLM processing
  void processInboundMessage(parsed.data).catch((err) =>
    console.error("[sendblue/webhook] processing error", err)
  );

  return NextResponse.json({ ok: true });
}

async function processInboundMessage(data: z.infer<typeof WebhookBodySchema>) {
  const client = await db.client.findFirst({
    where: { phoneEnc: { not: "" } },
    include: { advisor: true },
  });
  if (!client) return;

  await db.message.create({
    data: {
      threadId: `inbound:${data.from_number}`,
      advisorId: client.advisorId,
      clientId: client.id,
      direction: "INBOUND",
      channel: "SMS",
      body: data.content,
      sentAt: new Date(data.date),
    },
  });

  // TODO(drift): enqueue AI agent response via job queue (e.g. BullMQ/Inngest)
}
