import { NextResponse } from "next/server";
import { z } from "zod";

export interface RouteGuardErrorResponse {
  success: false;
  code: string;
  message: string;
}

export type RouteGuardResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse<RouteGuardErrorResponse> };

const MAX_BODY_BYTES = 4096; // 4 KB limit

/**
 * Validates incoming AI route requests:
 * 1. Method check: POST only (405)
 * 2. Same-origin check: Origin host matches request host (403)
 * 3. Content-Type check: application/json (415)
 * 4. Body size check: 4 KB limit (413)
 * 5. JSON parsing & Zod schema validation (400)
 *
 * Returns either validated typed data or a ready-to-return NextResponse with consistent error JSON.
 */
export async function guardAiRoute<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<RouteGuardResult<T>> {
  // 1. Method: POST only
  if (request.method !== "POST") {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "method_not_allowed",
          message: "Only POST requests are permitted.",
        },
        {
          status: 405,
          headers: { Allow: "POST" },
        }
      ),
    };
  }

  // 2. Same-origin check (Origin host equals request host, matching BFF pattern)
  const origin = request.headers.get("origin");
  const rawForwardedHost = request.headers.get("x-forwarded-host");
  const firstForwardedHost = rawForwardedHost
    ? rawForwardedHost.split(",")[0].trim()
    : null;
  const targetHost = firstForwardedHost || request.headers.get("host");

  if (!origin || !targetHost) {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "forbidden",
          message: "Cross-origin requests forbidden.",
        },
        { status: 403 }
      ),
    };
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost.toLowerCase() !== targetHost.toLowerCase()) {
      return {
        success: false,
        response: NextResponse.json<RouteGuardErrorResponse>(
          {
            success: false,
            code: "forbidden",
            message: "Cross-origin requests forbidden.",
          },
          { status: 403 }
        ),
      };
    }
  } catch {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "forbidden",
          message: "Cross-origin requests forbidden.",
        },
        { status: 403 }
      ),
    };
  }

  // 3. Content-Type: JSON only
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "unsupported_media_type",
          message: "Content-Type must be application/json.",
        },
        { status: 415 }
      ),
    };
  }

  // 4. Body size limit (Content-Length header check)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "payload_too_large",
          message: `Request body exceeds the ${MAX_BODY_BYTES} bytes limit.`,
        },
        { status: 413 }
      ),
    };
  }

  // Read raw text & verify byte length
  let rawText = "";
  try {
    rawText = await request.text();
  } catch {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "bad_request",
          message: "Failed to read request body.",
        },
        { status: 400 }
      ),
    };
  }

  if (Buffer.byteLength(rawText, "utf8") > MAX_BODY_BYTES) {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "payload_too_large",
          message: `Request body exceeds the ${MAX_BODY_BYTES} bytes limit.`,
        },
        { status: 413 }
      ),
    };
  }

  // 5. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "invalid_json",
          message: "Request body must be valid JSON.",
        },
        { status: 400 }
      ),
    };
  }

  // 6. Validate with Zod schema
  const validation = schema.safeParse(parsedJson);
  if (!validation.success) {
    return {
      success: false,
      response: NextResponse.json<RouteGuardErrorResponse>(
        {
          success: false,
          code: "validation_error",
          message: validation.error.issues
            .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
            .join("; "),
        },
        { status: 400 }
      ),
    };
  }

  return {
    success: true,
    data: validation.data,
  };
}
