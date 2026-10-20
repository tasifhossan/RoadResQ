import "server-only";
import { createHash } from "node:crypto";

/**
 * Best-effort in-memory rate limiting and LRU cache for AI routes.
 *
 * ⚠ SERVERLESS LIMITATION: In serverless environments (Vercel, Lambda, etc.)
 * each cold start creates a fresh instance. These limits are per-isolate,
 * NOT globally shared. They protect against bursts within a single instance
 * but cannot enforce hard global limits without external storage (e.g. Redis).
 * For a free-tier hobby project this is acceptable — it prevents a single
 * client from hammering the Gemini API within one warm instance.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PER_CLIENT_WINDOW_MS = 60_000; // 1 minute sliding window
const PER_CLIENT_LIMIT_PER_MINUTE = 6;
const PER_CLIENT_LIMIT_PER_DAY = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

const GLOBAL_DAILY_CAP = 300;

const CACHE_MAX_ENTRIES = 200;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

interface ClientRecord {
  /** Timestamps of requests in the current minute window. */
  minuteTimestamps: number[];
  /** Timestamps of requests in the current day window. */
  dayTimestamps: number[];
}

interface CacheEntry<T = unknown> {
  data: T;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// State (per isolate)
// ---------------------------------------------------------------------------
const clients = new Map<string, ClientRecord>();
let globalDayStart = startOfDay(Date.now());
let globalDayCount = 0;

// LRU cache: Map preserves insertion order — oldest entries are first.
const cache = new Map<string, CacheEntry>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Build a client key from the first x-forwarded-for IP and optional user ID.
 * The result is hashed so raw IPs are never stored in memory.
 */
export function clientKey(
  xForwardedFor: string | null,
  userId?: string | null
): string {
  const ip = xForwardedFor?.split(",")[0]?.trim() ?? "unknown";
  const raw = userId ? `${ip}:${userId}` : ip;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

/**
 * Check (and record) a request against per-client and global rate limits.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  // --- Global daily cap ---
  const todayStart = startOfDay(now);
  if (todayStart !== globalDayStart) {
    // New day — reset
    globalDayStart = todayStart;
    globalDayCount = 0;
  }
  if (globalDayCount >= GLOBAL_DAILY_CAP) {
    const secondsUntilMidnight = Math.ceil(
      (todayStart + DAY_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds: secondsUntilMidnight };
  }

  // --- Per-client limits ---
  let record = clients.get(key);
  if (!record) {
    record = { minuteTimestamps: [], dayTimestamps: [] };
    clients.set(key, record);
  }

  // Prune stale entries
  record.minuteTimestamps = record.minuteTimestamps.filter(
    (t) => now - t < PER_CLIENT_WINDOW_MS
  );
  record.dayTimestamps = record.dayTimestamps.filter(
    (t) => now - t < DAY_MS
  );

  // Per-minute check
  if (record.minuteTimestamps.length >= PER_CLIENT_LIMIT_PER_MINUTE) {
    const oldestInWindow = record.minuteTimestamps[0];
    const retryAfterSeconds = Math.ceil(
      (oldestInWindow + PER_CLIENT_WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  // Per-day check
  if (record.dayTimestamps.length >= PER_CLIENT_LIMIT_PER_DAY) {
    const secondsUntilMidnight = Math.ceil(
      (todayStart + DAY_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds: secondsUntilMidnight };
  }

  // All clear — record the request
  record.minuteTimestamps.push(now);
  record.dayTimestamps.push(now);
  globalDayCount++;

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// LRU cache (feature + normalised input → cached AI result)
// ---------------------------------------------------------------------------

/**
 * Build a deterministic cache key from a feature name and normalised input.
 */
export function cacheKey(feature: string, normalizedInput: string): string {
  return createHash("sha256")
    .update(`${feature}:${normalizedInput}`)
    .digest("hex")
    .slice(0, 24);
}

/**
 * Get a cached result, or undefined if not cached / expired.
 */
export function getCached<T = unknown>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }

  // Move to end (most-recently used)
  cache.delete(key);
  cache.set(key, entry);
  return entry.data as T;
}

/**
 * Store a result in the LRU cache, evicting the oldest if full.
 */
export function setCached<T = unknown>(key: string, data: T): void {
  // If key exists, delete first so it moves to end
  if (cache.has(key)) {
    cache.delete(key);
  }

  // Evict oldest entries if at capacity
  while (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }

  cache.set(key, { data, createdAt: Date.now() });
}
