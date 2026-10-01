import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, ROLE_HOME_MAP } from "@/lib/auth/constants";
import { decodeJwt } from "@/lib/auth/jwt";
import { refreshSession } from "@/lib/auth/refresh";
import { AuthTokens } from "@/lib/auth/cookies";

/**
 * Route protection and silent token refresh proxy for Next.js 16.
 * Note: Role extraction relies on decodeJwt (unverified JWT payload decoding).
 * The backend REST API strictly enforces RBAC on all endpoints; route protection here is for UI/routing UX only.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  // 1. Read access and refresh cookies
  const accessToken = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_REFRESH_TOKEN)?.value;

  const nowSeconds = Math.floor(Date.now() / 1000);
  let currentAccess = accessToken;
  let newTokens: AuthTokens | null = null;
  let refreshFailed = false;

  // Check if access cookie is missing or expires within 30s
  let isAccessMissingOrExpiring = !accessToken;
  if (accessToken) {
    const decoded = decodeJwt(accessToken);
    if (!decoded || decoded.exp <= nowSeconds + 30) {
      isAccessMissingOrExpiring = true;
    }
  }

  // Perform single-flight silent refresh if access is missing/expiring and refresh cookie exists
  if (isAccessMissingOrExpiring && refreshToken) {
    try {
      newTokens = await refreshSession(refreshToken);
      currentAccess = newTokens.accessToken;
    } catch {
      refreshFailed = true;
      currentAccess = undefined;
    }
  }

  // Extract session payload from current access token
  const session = currentAccess ? decodeJwt(currentAccess) : null;

  // Protected & Auth route checks
  const isCustomerRoute = pathname.startsWith("/customer");
  const isMechanicRoute = pathname.startsWith("/mechanic");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = isCustomerRoute || isMechanicRoute || isAdminRoute;
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  let redirectUrl: URL | null = null;

  if (isProtectedRoute) {
    if (!session) {
      // 2. No valid session on protected path -> redirect to /login?next=<path+query>
      redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname + search);
    } else {
      // 3. Wrong role -> redirect to that role's home
      const role = session.role;
      if (isCustomerRoute && role !== "CUSTOMER") {
        redirectUrl = new URL(ROLE_HOME_MAP[role] || "/", request.url);
      } else if (isMechanicRoute && role !== "MECHANIC") {
        redirectUrl = new URL(ROLE_HOME_MAP[role] || "/", request.url);
      } else if (isAdminRoute && role !== "ADMIN") {
        redirectUrl = new URL(ROLE_HOME_MAP[role] || "/", request.url);
      }
    }
  } else if (isAuthRoute && session) {
    // 4. Logged in on /login or /register -> redirect to role's home
    const roleHome = ROLE_HOME_MAP[session.role] || "/";
    redirectUrl = new URL(roleHome, request.url);
  }

  // Construct base response (redirect or next)
  let response: NextResponse;

  if (redirectUrl) {
    response = NextResponse.redirect(redirectUrl);
  } else {
    // Forward request to Server Components with updated Cookie header if tokens refreshed/cleared
    if (newTokens || refreshFailed) {
      const requestHeaders = new Headers(request.headers);
      const existingCookies = request.cookies.getAll();
      const cookieMap = new Map<string, string>();

      for (const c of existingCookies) {
        cookieMap.set(c.name, c.value);
      }

      if (newTokens) {
        cookieMap.set(COOKIE_ACCESS_TOKEN, newTokens.accessToken);
        cookieMap.set(COOKIE_REFRESH_TOKEN, newTokens.refreshToken);
      } else if (refreshFailed) {
        cookieMap.delete(COOKIE_ACCESS_TOKEN);
        cookieMap.delete(COOKIE_REFRESH_TOKEN);
      }

      const updatedCookieString = Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");

      requestHeaders.set("cookie", updatedCookieString);

      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      response = NextResponse.next();
    }
  }

  // Apply or clear cookies on response
  const isProduction = process.env.NODE_ENV === "production";

  if (newTokens) {
    const accessPayload = decodeJwt(newTokens.accessToken);
    const refreshPayload = decodeJwt(newTokens.refreshToken);

    const accessMaxAge = accessPayload
      ? Math.max(0, accessPayload.exp - nowSeconds)
      : 15 * 60;
    const refreshMaxAge = refreshPayload
      ? Math.max(0, refreshPayload.exp - nowSeconds)
      : 7 * 24 * 60 * 60;

    response.cookies.set(COOKIE_ACCESS_TOKEN, newTokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: accessMaxAge,
    });

    response.cookies.set(COOKIE_REFRESH_TOKEN, newTokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: refreshMaxAge,
    });
  } else if (refreshFailed) {
    response.cookies.delete(COOKIE_ACCESS_TOKEN);
    response.cookies.delete(COOKIE_REFRESH_TOKEN);
  }

  return response;
}

// 5. Skip /api/*, /_next/*, and static files via matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
