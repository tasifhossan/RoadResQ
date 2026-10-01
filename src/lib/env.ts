import { z } from "zod";

const envSchema = z.object({
  BACKEND_URL: z
    .string()
    .url("BACKEND_URL must be a valid URL")
    .default("https://road-res-q-backend.vercel.app/api/v1"),
  DEMO_PASSWORD: z.string().optional(),
});

const _env = envSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  DEMO_PASSWORD: process.env.DEMO_PASSWORD,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables. Check server configuration.");
}

export const env = _env.data;
