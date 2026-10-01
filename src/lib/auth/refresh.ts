import "server-only";
import { serverFetch } from "@/lib/api/server";
import { setAuthCookies, AuthTokens } from "./cookies";

const inFlightMap = new Map<string, Promise<AuthTokens>>();
const settledMap = new Map<string, { result: AuthTokens; timestamp: number }>();

const SETTLED_CACHE_TTL_MS = 10 * 1000; // Keep settled result for 10s to prevent replay of rotated token

/**
 * Refreshes an expired session using a refresh token with single-flight request deduplication.
 * Concurrent callers share a single backend request, and settled results are cached for 10s.
 */
export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const now = Date.now();

  // 1. Clean up stale settled entries older than 10s
  for (const [key, entry] of settledMap.entries()) {
    if (now - entry.timestamp > SETTLED_CACHE_TTL_MS) {
      settledMap.delete(key);
    }
  }

  // 2. Check if a recent settled result exists for this refresh token
  const settled = settledMap.get(refreshToken);
  if (settled && now - settled.timestamp <= SETTLED_CACHE_TTL_MS) {
    return settled.result;
  }

  // 3. Check if a single-flight request is already in flight
  const existingInFlight = inFlightMap.get(refreshToken);
  if (existingInFlight) {
    return existingInFlight;
  }

  // 4. Initiate single-flight refresh request
  const refreshPromise = (async () => {
    try {
      const tokens = await serverFetch<AuthTokens>("/auth/refresh-token", {
        method: "POST",
        body: { refreshToken },
      });

      await setAuthCookies(tokens);

      settledMap.set(refreshToken, {
        result: tokens,
        timestamp: Date.now(),
      });

      return tokens;
    } catch (error) {
      settledMap.delete(refreshToken);
      throw error;
    } finally {
      inFlightMap.delete(refreshToken);
    }
  })();

  inFlightMap.set(refreshToken, refreshPromise);
  return refreshPromise;
}
