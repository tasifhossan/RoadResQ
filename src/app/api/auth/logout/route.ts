import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/auth/constants";
import { invalidateRefreshCache } from "@/lib/auth/refresh";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    if (accessToken) {
      try {
        await serverFetch("/auth/logout", {
          method: "POST",
          token: accessToken,
          body: refreshToken ? { refreshToken } : undefined,
        });
      } catch {
        // Best-effort logout: ignore backend errors
      }
    }

    if (refreshToken) {
      invalidateRefreshCache(refreshToken);
    } else {
      invalidateRefreshCache();
    }

    await clearAuthCookies();
  } catch {
    // Ensure logout always succeeds even if cookieStore fails
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set(COOKIE_ACCESS_TOKEN, "", { maxAge: 0, path: "/" });
  response.cookies.set(COOKIE_REFRESH_TOKEN, "", { maxAge: 0, path: "/" });

  return response;
}
