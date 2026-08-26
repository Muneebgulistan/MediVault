import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://user:password@localhost:5432/medivault_db?schema=public"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required")
    .default("development-auth-secret-key-medivault-ai-32-chars"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OCR_SPACE_API_KEY: z.string().optional(),
});

/**
 * Validates process.env variables against envSchema.
 * Throws a detailed error message if validation fails.
 */
export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration.");
  }

  return parsed.data;
}

export const env = validateEnv();
