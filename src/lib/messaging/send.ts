import { z } from "zod";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { redact } from "@/lib/redact";

const SendMessageInputSchema = z.object({
  advisorId: z.string(),
  clientId: z.string(),
  body: z.string().min(1).max(1600),
  channel: z.enum(["SMS", "VOICE", "EMAIL"]),
  threadId: z.string().optional(),
});
export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

export interface MessageResult {
  messageId: string;
  status: "sent" | "queued" | "failed";
}

export async function sendMessage(input: SendMessageInput): Promise<MessageResult> {
  const parsed = SendMessageInputSchema.parse(input);

  const client = await db.client.findFirst({
    where: { id: parsed.clientId, deletedAt: null },
  });
  if (!client) throw new Error("Client not found");

  const now = new Date();
  const threadId = parsed.threadId ?? `${parsed.advisorId}:${parsed.clientId}`;

  // TODO(drift): implement opt-out/consent check before sending

  const res = await fetch("https://api.sendblue.co/api/send-message", {
    method: "POST",
    headers: {
      "sb-api-key-id": env.SENDBLUE_API_KEY,
      "sb-api-secret-key": env.SENDBLUE_API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: parsed.body }),
  });

  const data: unknown = await res.json();

  console.info("[messaging/send]", redact({ advisorId: parsed.advisorId, clientId: parsed.clientId, channel: parsed.channel, status: res.status }));

  await db.message.create({
    data: {
      threadId,
      advisorId: parsed.advisorId,
      clientId: parsed.clientId,
      direction: "OUTBOUND",
      channel: parsed.channel,
      body: parsed.body,
      sentAt: now,
    },
  });

  if (!res.ok) {
    return { messageId: "", status: "failed" };
  }

  const responseData = data as Record<string, unknown>;
  return {
    messageId: typeof responseData["message_handle"] === "string" ? responseData["message_handle"] : "",
    status: "sent",
  };
}
