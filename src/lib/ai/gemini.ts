import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "@/lib/env";

export type AiErrorCode =
  | "not_configured"
  | "rate_limited"
  | "timeout"
  | "invalid_output"
  | "unavailable";

export type GenerateJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AiErrorCode };

export interface GenerateJsonOptions<T> {
  system?: string;
  contents: string | string[];
  schema: z.ZodType<T>;
  maxOutputTokens?: number;
  temperature?: number; // default: 0.2
  timeoutMs?: number; // default: 12000
  feature?: string; // used for privacy-safe latency logging
}

// Lazy-initialized Gemini client instance
let clientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return clientInstance;
}

/**
 * Converts a Zod schema to a clean JSON Schema object compatible with Gemini API.
 */
function convertZodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  const cleanSchema = { ...jsonSchema };
  delete cleanSchema.$schema;
  return cleanSchema;
}

/**
 * Safely parses and validates JSON text against the provided Zod schema.
 */
function tryParseAndValidate<T>(
  text: string,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false } {
  try {
    const raw = JSON.parse(text);
    const result = schema.safeParse(raw);
    if (result.success) {
      return { success: true, data: result.data };
    }
  } catch {
    // Malformed JSON or schema mismatch
  }
  return { success: false };
}

/**
 * Generates structured JSON from Gemini using responseJsonSchema.
 *
 * Guarantees:
 * - Lazy client creation (no-op if not configured)
 * - Strict timeout via AbortSignal
 * - One retry on invalid JSON output
 * - Fallback model retry on 404 errors
 * - Privacy-safe logging (logs only feature, code, latency)
 */
export async function generateJson<T>({
  system,
  contents,
  schema,
  maxOutputTokens,
  temperature = 0.2,
  timeoutMs = 12000,
  feature = "ai_json",
}: GenerateJsonOptions<T>): Promise<GenerateJsonResult<T>> {
  const startTime = Date.now();

  const client = getGeminiClient();
  if (!client) {
    const latency = Date.now() - startTime;
    console.warn(`[AI:${feature}] status=not_configured latency=${latency}ms`);
    return { ok: false, code: "not_configured" };
  }

  const responseJsonSchema = convertZodToJsonSchema(schema);

  async function callModel(modelName: string): Promise<
    | { success: true; text: string }
    | {
        success: false;
        error: unknown;
        is404: boolean;
        isRateLimit: boolean;
        isTimeout: boolean;
      }
  > {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await client!.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: system,
          temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseJsonSchema,
          abortSignal: controller.signal,
        },
      });

      clearTimeout(timeoutHandle);
      const text = response.text;
      if (!text || typeof text !== "string") {
        return {
          success: false,
          error: new Error("Empty response text"),
          is404: false,
          isRateLimit: false,
          isTimeout: false,
        };
      }
      return { success: true, text };
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);
      const status = (err as { status?: number })?.status;
      const message = String((err as Error)?.message || "");
      const name = (err as Error)?.name || "";

      const isTimeout =
        controller.signal.aborted ||
        name === "AbortError" ||
        name === "TimeoutError" ||
        message.toLowerCase().includes("timeout");

      const is404 =
        status === 404 ||
        message.includes("404") ||
        message.includes("NOT_FOUND") ||
        message.toLowerCase().includes("not found");

      const isRateLimit =
        status === 429 ||
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.toLowerCase().includes("quota");

      return { success: false, error: err, is404, isRateLimit, isTimeout };
    }
  }

  let activeModel = env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  // Attempt 1 with primary model
  let callResult = await callModel(activeModel);

  // If 404 and fallback model configured, try fallback model
  if (
    !callResult.success &&
    callResult.is404 &&
    env.GEMINI_FALLBACK_MODEL &&
    env.GEMINI_FALLBACK_MODEL !== activeModel
  ) {
    activeModel = env.GEMINI_FALLBACK_MODEL;
    callResult = await callModel(activeModel);
  }

  if (!callResult.success) {
    const latency = Date.now() - startTime;
    let code: AiErrorCode = "unavailable";
    if (callResult.isTimeout) code = "timeout";
    else if (callResult.isRateLimit) code = "rate_limited";
    console.error(`[AI:${feature}] status=${code} latency=${latency}ms`);
    return { ok: false, code };
  }

  // Parse and validate structured output
  let parsed = tryParseAndValidate(callResult.text, schema);
  if (parsed.success) {
    const latency = Date.now() - startTime;
    console.log(`[AI:${feature}] status=ok latency=${latency}ms`);
    return { ok: true, data: parsed.data };
  }

  // Retry once on invalid JSON
  const retryResult = await callModel(activeModel);
  if (retryResult.success) {
    parsed = tryParseAndValidate(retryResult.text, schema);
    if (parsed.success) {
      const latency = Date.now() - startTime;
      console.log(`[AI:${feature}] status=ok (retry) latency=${latency}ms`);
      return { ok: true, data: parsed.data };
    }
  }

  const latency = Date.now() - startTime;
  console.error(`[AI:${feature}] status=invalid_output latency=${latency}ms`);
  return { ok: false, code: "invalid_output" };
}
