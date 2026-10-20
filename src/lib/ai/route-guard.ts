import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RouteGuardConfig<T extends z.ZodType> {
  /** Zod schema for validating the request body. */
  bodySchema: T;
  /** Maximum body size in bytes (default 4096 = 4 KB). */
  maxBodySize?: number;
}

export type GuardResult<T> =
  | { ok: true; data: T; request: NextRequest }
  | { ok: false; response: NextResponse };

// ---------------------------------------------------------------------------
// Consistent error JSON helper
// ---------------------------------------------------------------------------

function errorJson(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { success: false, code, message },
    { status, headers }
  );
}

// ---------------------------------------------------------------------------
// Route guard
// ---------------------------------------------------------------------------

/**
 * Validate an incoming request for AI route handlers.
 *
 * Checks:
 *  1. POST only
 *  2. JSON content-type
 *  3. Body size ≤ maxBodySize (default 4 KB)
 *  4. Same-origin (Origin host matches request host, like the BFF)
 *  5. Strict Zod body validation
 *
 * Returns either { ok: true, data } or { ok: false, response }.
 */
export async function guardAiRoute<T extends z.ZodType>(
  request: NextRequest,
  config: RouteGuardConfig<T>
): Promise<GuardResult<z.infer<T>>> {
  const { bodySchema, maxBodySize = 4096 } = config;

  // 1. POST only
  if (request.method !== "POST") {
    return {
      ok: false,
      response: errorJson("method_not_allowed", "Only POST is allowed", 405),
    };
  }

  // 2. JSON content-type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      response: errorJson("invalid_content_type", "Content-Type must be application/json", 415),
    };
  }

  // 3. Body size check (via Content-Length header first, then actual)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBodySize) {
    return {
      ok: false,
      response: errorJson(
        "payload_too_large",
        `Body must be ${maxBodySize} bytes or less`,
        413
      ),
    };
  }

  // 4. Same-origin check (Origin host === request host)
  const origin = request.headers.get("origin");
  const rawForwardedHost = request.headers.get("x-forwarded-host");
  const firstForwardedHost = rawForwardedHost
    ? rawForwardedHost.split(",")[0].trim()
    : null;
  const targetHost = firstForwardedHost || request.headers.get("host");

  if (!origin || !targetHost) {
    return {
      ok: false,
      response: errorJson("forbidden", "Cross-origin requests forbidden", 403),
    };
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost.toLowerCase() !== targetHost.toLowerCase()) {
      return {
        ok: false,
        response: errorJson("forbidden", "Cross-origin requests forbidden", 403),
      };
    }
  } catch {
    return {
      ok: false,
      response: errorJson("forbidden", "Cross-origin requests forbidden", 403),
    };
  }

  // 5. Parse body and validate with Zod
  let rawBody: string;
  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > maxBodySize) {
      return {
        ok: false,
        response: errorJson(
          "payload_too_large",
          `Body must be ${maxBodySize} bytes or less`,
          413
        ),
      };
    }
    rawBody = new TextDecoder().decode(buffer);
  } catch {
    return {
      ok: false,
      response: errorJson("bad_request", "Could not read request body", 400),
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      response: errorJson("bad_request", "Invalid JSON in request body", 400),
    };
  }

  const validation = bodySchema.safeParse(parsed);
  if (!validation.success) {
    return {
      ok: false,
      response: errorJson(
        "validation_error",
        "Invalid request body",
        422
      ),
    };
  }

  return { ok: true, data: validation.data, request };
}
