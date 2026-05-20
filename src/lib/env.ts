import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  SENDBLUE_API_KEY: z.string().min(1),
  SENDBLUE_API_SECRET: z.string().min(1),
  SENDBLUE_WEBHOOK_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(64),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// Skip strict validation at build time; Next.js evaluates this module during compilation.
// At runtime (server requests), all vars must be present.
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== "development") {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — check .env.example");
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<typeof EnvSchema>;
