import "server-only";

import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { env } from "@/lib/env";
import { z, toJSONSchema } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeminiErrorCode =
  | "not_configured"
  | "rate_limited"
  | "timeout"
  | "invalid_output"
  | "unavailable";

export type GeminiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: GeminiErrorCode };

export interface GenerateJsonOptions<T extends z.ZodType> {
  /** System instruction for the model. */
  system: string;
  /** User content / prompt (the sanitized input). */
  contents: string;
  /** Zod schema to validate the response against. */
  schema: T;
  /** Max output tokens (default 1024). */
  maxOutputTokens?: number;
  /** Temperature (default 0.2). */
  temperature?: number;
  /** Request timeout in ms (default 12000). */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Lazy client (singleton per isolate)
// ---------------------------------------------------------------------------

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (_client) return _client;
  if (!env.GEMINI_API_KEY) return null;
  _client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _client;
}

// ---------------------------------------------------------------------------
// generateJson
// ---------------------------------------------------------------------------

/**
 * Call Gemini with a Zod schema for JSON-structured output.
 *
 * - Retries once on invalid JSON (parse / validation failure).
 * - On a 404 model error, tries GEMINI_FALLBACK_MODEL if configured.
 * - Never logs the key, prompt, or response text — only feature, code, latency.
 */
export async function generateJson<T extends z.ZodType>(
  feature: string,
  options: GenerateJsonOptions<T>
): Promise<GeminiResult<z.infer<T>>> {
  const {
    system,
    contents,
    schema,
    maxOutputTokens = 1024,
    temperature = 0.2,
    timeoutMs = 12_000,
  } = options;

  const client = getClient();
  if (!client) {
    return { ok: false, code: "not_configured" };
  }

  const jsonSchema = toJSONSchema(schema);
  const model = env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";

  // Try primary model, then fallback on 404
  const modelsToTry = [model];
  if (env.GEMINI_FALLBACK_MODEL && env.GEMINI_FALLBACK_MODEL !== model) {
    modelsToTry.push(env.GEMINI_FALLBACK_MODEL);
  }

  for (const currentModel of modelsToTry) {
    const result = await tryModel(
      client,
      feature,
      currentModel,
      { system, contents, jsonSchema, maxOutputTokens, temperature, timeoutMs },
      schema
    );

    // If not a 404 / model-unavailable error, return immediately
    if (result.ok || result.code !== "unavailable") {
      return result;
    }

    // If this model failed with 404, try next (fallback)
    console.warn(`[AI:${feature}] model=${currentModel} unavailable, trying next`);
  }

  return { ok: false, code: "unavailable" };
}

// ---------------------------------------------------------------------------
// Internal: try a single model with one retry on invalid JSON
// ---------------------------------------------------------------------------

interface CallConfig {
  system: string;
  contents: string;
  jsonSchema: unknown;
  maxOutputTokens: number;
  temperature: number;
  timeoutMs: number;
}

async function tryModel<T extends z.ZodType>(
  client: GoogleGenAI,
  feature: string,
  model: string,
  cfg: CallConfig,
  schema: T
): Promise<GeminiResult<z.infer<T>>> {
  const MAX_ATTEMPTS = 2; // 1 initial + 1 retry on invalid JSON

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const start = Date.now();
    let response: GenerateContentResponse;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

      response = await client.models.generateContent({
        model,
        contents: cfg.contents,
        config: {
          systemInstruction: cfg.system,
          responseMimeType: "application/json",
          responseJsonSchema: cfg.jsonSchema,
          maxOutputTokens: cfg.maxOutputTokens,
          temperature: cfg.temperature,
          abortSignal: controller.signal,
        },
      });

      clearTimeout(timer);
    } catch (err: unknown) {
      const latency = Date.now() - start;

      if (err instanceof Error && err.name === "AbortError") {
        console.error(`[AI:${feature}] code=timeout latency=${latency}ms`);
        return { ok: false, code: "timeout" };
      }

      // 404 → model not found
      if (is404Error(err)) {
        console.error(`[AI:${feature}] code=unavailable model=${model} latency=${latency}ms`);
        return { ok: false, code: "unavailable" };
      }

      // 429 → rate limited
      if (is429Error(err)) {
        console.error(`[AI:${feature}] code=rate_limited latency=${latency}ms`);
        return { ok: false, code: "rate_limited" };
      }

      console.error(`[AI:${feature}] code=unavailable latency=${latency}ms`);
      return { ok: false, code: "unavailable" };
    }

    const latency = Date.now() - start;
    const text = response.text;

    if (!text) {
      console.error(`[AI:${feature}] code=invalid_output latency=${latency}ms attempt=${attempt} reason=empty_response`);
      if (attempt < MAX_ATTEMPTS) continue;
      return { ok: false, code: "invalid_output" };
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error(`[AI:${feature}] code=invalid_output latency=${latency}ms attempt=${attempt} reason=json_parse_error`);
      if (attempt < MAX_ATTEMPTS) continue;
      return { ok: false, code: "invalid_output" };
    }

    // Validate with Zod
    const validation = schema.safeParse(parsed);
    if (!validation.success) {
      console.error(`[AI:${feature}] code=invalid_output latency=${latency}ms attempt=${attempt} reason=schema_validation`);
      if (attempt < MAX_ATTEMPTS) continue;
      return { ok: false, code: "invalid_output" };
    }

    console.info(`[AI:${feature}] code=ok model=${model} latency=${latency}ms`);
    return { ok: true, data: validation.data };
  }

  // Should not reach here, but just in case
  return { ok: false, code: "invalid_output" };
}

// ---------------------------------------------------------------------------
// Error inspection helpers (HTTP status from SDK errors)
// ---------------------------------------------------------------------------

function getStatusFromError(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    // The SDK may attach status or httpStatusCode
    if ("status" in err && typeof (err as Record<string, unknown>).status === "number") {
      return (err as Record<string, unknown>).status as number;
    }
    if ("httpStatusCode" in err && typeof (err as Record<string, unknown>).httpStatusCode === "number") {
      return (err as Record<string, unknown>).httpStatusCode as number;
    }
    // Check message for status code pattern
    if (err instanceof Error) {
      const match = err.message.match(/\b(404|429)\b/);
      if (match) return parseInt(match[1], 10);
    }
  }
  return undefined;
}

function is404Error(err: unknown): boolean {
  return getStatusFromError(err) === 404;
}

function is429Error(err: unknown): boolean {
  return getStatusFromError(err) === 429;
}
