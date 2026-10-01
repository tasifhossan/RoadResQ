import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/api/server";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/lib/auth/constants";

export async function POST() {
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

  await clearAuthCookies();

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
