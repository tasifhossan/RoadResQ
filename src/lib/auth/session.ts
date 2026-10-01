import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, ROLE_HOME_MAP } from "./constants";
import { decodeJwt } from "./jwt";
import { refreshSession } from "./refresh";
import { serverFetch } from "@/lib/api/server";
import { Role } from "@/lib/api/types";

export interface SessionPayload {
  id: string;
  role: Role;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mechanicProfile?: {
    id: string;
    userId: string;
    skills: string[];
    currentLat: number | null;
    currentLng: number | null;
    availability: string;
    rating: number;
    totalJobs: number;
  } | null;
}

/**
 * Gets the current session payload from cookies or refreshes session if access token expired.
 * Returns null if unauthenticated or refresh fails.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

  const nowSeconds = Math.floor(Date.now() / 1000);

  // 1. Valid access token present (buffer of 5s before exp)
  if (accessToken) {
    const decoded = decodeJwt(accessToken);
    if (decoded && decoded.exp > nowSeconds + 5) {
      return {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };
    }
  }

  // 2. Access token missing or expired -> attempt refresh if refresh token present
  if (refreshToken) {
    try {
      const tokens = await refreshSession(refreshToken);
      const decodedNew = decodeJwt(tokens.accessToken);
      if (decodedNew) {
        return {
          id: decodedNew.id,
          role: decodedNew.role,
          email: decodedNew.email,
        };
      }
    } catch {
      // Refresh failed or token revoked
    }
  }

  return null;
}

/**
 * Retrieves full authenticated user profile from GET /users/me.
 * Cached per-request using React cache(). Returns null on error or 401.
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  if (!accessToken) {
    // Attempt session recovery to populate access cookie
    const session = await getSession();
    if (!session) return null;
  }

  const updatedCookieStore = await cookies();
  const currentToken = updatedCookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  if (!currentToken) return null;

  try {
    const res = await serverFetch<{ user: UserProfile }>("/users/me", {
      token: currentToken,
    });
    return res.user;
  } catch {
    return null;
  }
});

/**
 * Enforces authentication and role-based access control for Server Components.
 * Redirects to /login if unauthenticated, or to the user's home path if role mismatch.
 */
export async function requireRole(allowedRoles: Role | Role[]): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const allowedList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!allowedList.includes(session.role)) {
    const targetHome = ROLE_HOME_MAP[session.role] || "/";
    redirect(targetHome);
  }

  return session;
}
