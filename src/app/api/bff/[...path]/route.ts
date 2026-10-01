import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { decodeJwt } from "@/lib/auth/jwt";
import { refreshSession } from "@/lib/auth/refresh";

export const dynamic = "force-dynamic";

const ALLOWED_FIRST_SEGMENTS = new Set([
  "users",
  "vehicles",
  "mechanics",
  "service-requests",
  "spare-parts",
  "invoices",
  "payments",
  "reviews",
  "admin",
]);

const MAX_BODY_SIZE = 4 * 1024 * 1024; // 4MB

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

async function handleBffRequest(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];

  // 1. Allowlist & Auth path check
  if (
    pathSegments.length === 0 ||
    pathSegments[0] === "auth" ||
    !ALLOWED_FIRST_SEGMENTS.has(pathSegments[0])
  ) {
    return NextResponse.json(
      { success: false, message: "Endpoint not found" },
      { status: 404 }
    );
  }

  // 2. CSRF check for non-GET methods
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || request.headers.get("x-forwarded-host");

    if (!origin || !host) {
      return NextResponse.json(
        { success: false, message: "Cross-origin requests forbidden" },
        { status: 403 }
      );
    }

    try {
      const originHost = new URL(origin).host;
      if (originHost.toLowerCase() !== host.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: "Cross-origin requests forbidden" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: "Cross-origin requests forbidden" },
        { status: 403 }
      );
    }
  }

  // 3. Body size limit check
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { success: false, message: "Payload exceeds maximum allowed size of 4MB" },
      { status: 413 }
    );
  }

  let bodyBuffer: ArrayBuffer | null = null;
  if (request.method !== "GET" && request.body) {
    bodyBuffer = await request.arrayBuffer();
    if (bodyBuffer.byteLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Payload exceeds maximum allowed size of 4MB" },
        { status: 413 }
      );
    }
  }

  // 4. Token & Session checking / pre-flight refresh
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

  const nowSeconds = Math.floor(Date.now() / 1000);
  let isAccessExpiredOrMissing = !accessToken;

  if (accessToken) {
    const decoded = decodeJwt(accessToken);
    if (!decoded || decoded.exp <= nowSeconds + 5) {
      isAccessExpiredOrMissing = true;
    }
  }

  if (isAccessExpiredOrMissing && refreshToken) {
    try {
      const newTokens = await refreshSession(refreshToken);
      accessToken = newTokens.accessToken;
    } catch {
      await clearAuthCookies();
      return NextResponse.json(
        { success: false, message: "Unauthorized. Session expired." },
        { status: 401 }
      );
    }
  }

  // 5. Build target backend URL & headers
  const targetPath = pathSegments.join("/");
  const queryString = request.nextUrl.search;
  const targetUrl = `${env.BACKEND_URL}/${targetPath}${queryString}`;

  const forwardHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "content-length" &&
      lowerKey !== "cookie" &&
      lowerKey !== "set-cookie" &&
      lowerKey !== "authorization"
    ) {
      forwardHeaders[key] = value;
    }
  });

  if (accessToken) {
    forwardHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  // 6. First backend request attempt
  let backendRes = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body: bodyBuffer,
    cache: "no-store",
  });

  // 7. Backend 401 single-flight retry
  if (backendRes.status === 401 && refreshToken) {
    try {
      const refreshedTokens = await refreshSession(refreshToken);
      forwardHeaders["Authorization"] = `Bearer ${refreshedTokens.accessToken}`;

      backendRes = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body: bodyBuffer,
        cache: "no-store",
      });
    } catch {
      await clearAuthCookies();
      return NextResponse.json(
        { success: false, message: "Unauthorized. Session expired." },
        { status: 401 }
      );
    }
  }

  // 8. Return response
  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseContentType = backendRes.headers.get("content-type") || "application/json";
  const responseData = await backendRes.arrayBuffer();

  return new NextResponse(responseData, {
    status: backendRes.status,
    headers: {
      "Content-Type": responseContentType,
    },
  });
}

export async function GET(request: NextRequest, context: RouteParams) {
  return handleBffRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteParams) {
  return handleBffRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return handleBffRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return handleBffRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return handleBffRequest(request, context);
}
