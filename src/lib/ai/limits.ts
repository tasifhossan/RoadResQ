/**
 * In-memory rate limiting and caching for Gemini AI routes.
 *
 * NOTE ON SERVERLESS LIMITATION:
 * In serverless environments (such as Vercel Edge or Serverless Functions), each instance
 * maintains its own independent in-memory state. This provides best-effort protection against
 * bursts and single-instance abuse, but limits are not globally synchronized across multiple
 * concurrent worker instances.
 */

import { createHash } from "node:crypto";

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfter?: number; // In seconds
  reason?: "rate_limited_minute" | "rate_limited_day" | "rate_limited_global";
}

interface ClientRecord {
  timestamps: number[];
}

const MINUTE_LIMIT = 6;
const MINUTE_WINDOW_MS = 60 * 1000;

const CLIENT_DAY_LIMIT = 40;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;

const GLOBAL_DAY_LIMIT = 300;

const CACHE_MAX_ENTRIES = 200;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// In-memory sliding windows
const clientBuckets = new Map<string, ClientRecord>();
const globalTimestamps: number[] = [];

// LRU Cache for AI responses
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const aiCache = new Map<string, CacheEntry<unknown>>();

/**
 * Extracts and hashes the client identifier:
 * Hashed first x-forwarded-for IP + user ID (when logged in).
 */
export function getClientKey(
  forwardedForHeader: string | null | undefined,
  userId?: string | null
): string {
  const firstIp = forwardedForHeader
    ? forwardedForHeader.split(",")[0].trim()
    : "127.0.0.1";
  const rawKey = `${firstIp}:${userId || "anonymous"}`;
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Checks in-memory sliding window rate limits:
 * - 6 requests / minute per client
 * - 40 requests / day per client
 * - 300 requests / day global cap
 */
export function checkAiRateLimit(
  forwardedForHeader: string | null | undefined,
  userId?: string | null
): RateLimitCheckResult {
  const now = Date.now();
  const clientKey = getClientKey(forwardedForHeader, userId);

  // 1. Clean and check global daily limit (300 / day)
  while (globalTimestamps.length > 0 && globalTimestamps[0] <= now - DAY_WINDOW_MS) {
    globalTimestamps.shift();
  }
  if (globalTimestamps.length >= GLOBAL_DAY_LIMIT) {
    const oldest = globalTimestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + DAY_WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      retryAfter,
      reason: "rate_limited_global",
    };
  }

  // 2. Clean and check client limits
  let clientRecord = clientBuckets.get(clientKey);
  if (!clientRecord) {
    clientRecord = { timestamps: [] };
    clientBuckets.set(clientKey, clientRecord);
  }

  // Purge records older than 24h
  clientRecord.timestamps = clientRecord.timestamps.filter((t) => t > now - DAY_WINDOW_MS);

  // Check 1-minute window (6 / min)
  const minuteTimestamps = clientRecord.timestamps.filter((t) => t > now - MINUTE_WINDOW_MS);
  if (minuteTimestamps.length >= MINUTE_LIMIT) {
    const oldestInMinute = minuteTimestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldestInMinute + MINUTE_WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      retryAfter,
      reason: "rate_limited_minute",
    };
  }

  // Check 24-hour window (40 / day)
  if (clientRecord.timestamps.length >= CLIENT_DAY_LIMIT) {
    const oldestInDay = clientRecord.timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldestInDay + DAY_WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      retryAfter,
      reason: "rate_limited_day",
    };
  }

  // Record allowed request
  clientRecord.timestamps.push(now);
  globalTimestamps.push(now);

  return { allowed: true };
}

/**
 * Computes LRU cache key for a given feature and normalized input.
 */
function getCacheKey(feature: string, normalizedInput: string): string {
  const raw = `${feature}:${normalizedInput.trim().toLowerCase()}`;
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Retrieves a value from the LRU cache if present and unexpired.
 */
export function getAiCache<T>(feature: string, normalizedInput: string): T | null {
  const key = getCacheKey(feature, normalizedInput);
  const entry = aiCache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    aiCache.delete(key);
    return null;
  }

  // Move to back (most recently used)
  aiCache.delete(key);
  aiCache.set(key, entry);

  return entry.value as T;
}

/**
 * Stores a value in the LRU cache (capped at 200 entries, 10-minute TTL).
 */
export function setAiCache<T>(feature: string, normalizedInput: string, value: T): void {
  const key = getCacheKey(feature, normalizedInput);

  if (aiCache.has(key)) {
    aiCache.delete(key);
  } else if (aiCache.size >= CACHE_MAX_ENTRIES) {
    // Evict oldest (least recently used)
    const oldestKey = aiCache.keys().next().value;
    if (oldestKey) {
      aiCache.delete(oldestKey);
    }
  }

  aiCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
