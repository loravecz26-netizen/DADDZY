import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdvisor, AuthError } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  let advisorId: string;
  try {
    ({ advisorId } = await requireAdvisor());
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: err.message } }, { status: 401 });
    }
    throw err;
  }

  const { allowed, remaining } = checkRateLimit(`chat:${advisorId}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  const body: unknown = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid request body" } },
      { status: 400 }
    );
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system:
      "You are Drift AI, an intelligent assistant for financial advisors. " +
      "Answer questions about clients, portfolios, and advisory tasks. " +
      "Be concise and professional. Never fabricate client data.",
    messages: parsed.data.messages,
  });

  return result.toDataStreamResponse();
}
