import "server-only";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "./constants";
import { decodeJwt } from "./jwt";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Sets httpOnly access and refresh authentication cookies.
 * Each cookie maxAge is dynamically derived from its token's exp claim.
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();

  const accessPayload = decodeJwt(tokens.accessToken);
  const refreshPayload = decodeJwt(tokens.refreshToken);

  const nowSeconds = Math.floor(Date.now() / 1000);

  // Fallback defaults if exp claim is missing: 15 mins for access, 7 days for refresh
  const accessMaxAge = accessPayload
    ? Math.max(0, accessPayload.exp - nowSeconds)
    : 15 * 60;

  const refreshMaxAge = refreshPayload
    ? Math.max(0, refreshPayload.exp - nowSeconds)
    : 7 * 24 * 60 * 60;

  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: accessMaxAge,
  });

  cookieStore.set(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: refreshMaxAge,
  });
}

/**
 * Clears both access and refresh authentication cookies.
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
}
