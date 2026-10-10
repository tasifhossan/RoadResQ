import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/auth/constants";
import { invalidateRefreshCache, refreshSession } from "@/lib/auth/refresh";
import { decodeJwt } from "@/lib/auth/jwt";

export async function POST() {
  let activeAccessToken: string | undefined = undefined;
  let activeRefreshToken: string | undefined = undefined;
  let oldRefreshToken: string | undefined = undefined;
  let freshRefreshToken: string | undefined = undefined;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    oldRefreshToken = refreshToken;
    activeRefreshToken = refreshToken;

    const nowSeconds = Math.floor(Date.now() / 1000);
    let isAccessExpiredOrMissing = !accessToken;

    if (accessToken) {
      const decoded = decodeJwt(accessToken);
      if (!decoded || decoded.exp <= nowSeconds + 5) {
        isAccessExpiredOrMissing = true;
      } else {
        activeAccessToken = accessToken;
      }
    }

    // Recover valid access token if expired so backend can authenticate session revocation
    if (isAccessExpiredOrMissing && refreshToken) {
      try {
        const tokens = await refreshSession(refreshToken);
        activeAccessToken = tokens.accessToken;
        freshRefreshToken = tokens.refreshToken;
        activeRefreshToken = freshRefreshToken;
      } catch {
        // Refresh failed (session already invalid)
      }
    }

    // Revoke active (fresh or current) refresh token on backend
    if (activeAccessToken && activeRefreshToken) {
      try {
        await serverFetch("/auth/logout", {
          method: "POST",
          token: activeAccessToken,
          body: { refreshToken: activeRefreshToken },
        });
      } catch {
        // Best-effort logout: ignore backend errors
      }
    }

    // If a fresh token was issued during logout refresh, also revoke the old refresh token on backend if distinct
    if (
      activeAccessToken &&
      oldRefreshToken &&
      freshRefreshToken &&
      oldRefreshToken !== freshRefreshToken
    ) {
      try {
        await serverFetch("/auth/logout", {
          method: "POST",
          token: activeAccessToken,
          body: { refreshToken: oldRefreshToken },
        });
      } catch {
        // Best-effort logout: ignore backend errors
      }
    }
  } catch {
    // Ensure logout always succeeds even if cookieStore fails
  } finally {
    if (oldRefreshToken) invalidateRefreshCache(oldRefreshToken);
    if (freshRefreshToken) invalidateRefreshCache(freshRefreshToken);
    invalidateRefreshCache();

    try {
      await clearAuthCookies();
    } catch {
      // Ignore cookie store errors
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set(COOKIE_ACCESS_TOKEN, "", { maxAge: 0, path: "/" });
  response.cookies.set(COOKIE_REFRESH_TOKEN, "", { maxAge: 0, path: "/" });

  return response;
}
