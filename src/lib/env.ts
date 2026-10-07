import { z } from "zod";

const envSchema = z.object({
  BACKEND_URL: z
    .string()
    .url("BACKEND_URL must be a valid URL")
    .default("https://road-res-q-backend.vercel.app/api/v1"),
  DEMO_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_CONTACT_EMAIL: z
    .string()
    .email("NEXT_PUBLIC_CONTACT_EMAIL must be a valid email")
    .optional(),
});

const _env = envSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  DEMO_PASSWORD: process.env.DEMO_PASSWORD,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables. Check server configuration.");
}

export const env = _env.data;
