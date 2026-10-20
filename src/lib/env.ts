import { z } from "zod";

const envSchema = z.object({
  BACKEND_URL: z
    .string()
    .url("BACKEND_URL must be a valid URL")
    .default("https://road-res-q-backend.vercel.app/api/v1"),
  DEMO_PASSWORD: z.string().optional(),
  // ── Gemini AI (Server-only — never use NEXT_PUBLIC_ prefix) ──────────
  GEMINI_API_KEY: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().optional()),
  GEMINI_MODEL: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().optional().default("gemini-2.5-flash-lite")),
  GEMINI_FALLBACK_MODEL: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().optional()),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_CONTACT_EMAIL: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().email("NEXT_PUBLIC_CONTACT_EMAIL must be a valid email").optional()),
  NEXT_PUBLIC_LINKEDIN_URL: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().url("NEXT_PUBLIC_LINKEDIN_URL must be a valid URL").optional()),
  NEXT_PUBLIC_DEVELOPER_NAME: z
    .preprocess((val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().optional()),
});

const _env = envSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  DEMO_PASSWORD: process.env.DEMO_PASSWORD,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  NEXT_PUBLIC_DEVELOPER_NAME: process.env.NEXT_PUBLIC_DEVELOPER_NAME,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables. Check server configuration.");
}

export const env = _env.data;
