import "server-only";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { serverFetch } from "@/lib/api/server";
import { generateJson } from "@/lib/ai/gemini";
import { env } from "@/lib/env";
import {
  buildDeterministicInsights,
  BackendInsightsData,
  DeterministicInsight,
} from "@/lib/ai/admin-insights-rules";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const aiSummaryOutputSchema = z.object({
  headline: z.string().max(120),
  summary: z.string().max(500),
  recommendedActions: z.array(z.string().max(140)).max(3),
});

export type AiSummaryOutput = z.infer<typeof aiSummaryOutputSchema>;

// ---------------------------------------------------------------------------
// In-Memory Cache (15 min) & Rate Limiting (4 per hour per admin)
// ---------------------------------------------------------------------------

interface CachedAdminInsights {
  generatedAt: string;
  deterministic: DeterministicInsight[];
  ai: AiSummaryOutput | null;
  meta: { source: "ai" | "rules"; cached: boolean };
  dataMetrics: BackendInsightsData;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 4;

let cachedInsights: CachedAdminInsights | null = null;
const adminRateLimits = new Map<string, number[]>(); // adminId -> timestamps

// ---------------------------------------------------------------------------
// Grounding check: verify every number in AI text is present in the metrics
// ---------------------------------------------------------------------------

function extractNumbersFromText(text: string): number[] {
  const matches = text.match(/\b\d+(\.\d+)?\b/g);
  if (!matches) return [];
  return matches.map((m) => Number(m));
}

function collectAllMetricsNumbers(data: BackendInsightsData): Set<number> {
  const set = new Set<number>();

  function addNum(n: number | string | null | undefined) {
    if (n === null || n === undefined) return;
    const num = Number(n);
    if (!Number.isNaN(num)) {
      set.add(num);
      set.add(Math.round(num));
      set.add(Number(num.toFixed(1)));
    }
  }

  // Requests
  addNum(data.requests.last14Days);
  addNum(data.requests.previous14Days);
  addNum(data.requests.changePct);
  addNum(Math.abs(data.requests.changePct));
  addNum(data.requests.completionRate);
  addNum(data.requests.completionRate * 100);
  addNum(Math.round(data.requests.completionRate * 100));
  addNum(data.requests.cancellationRate);
  addNum(data.requests.cancellationRate * 100);
  addNum(Math.round(data.requests.cancellationRate * 100));

  // Revenue & Rating
  addNum(data.revenue.last14Days);
  addNum(data.revenue.previous14Days);
  addNum(data.rating.last14Days);
  addNum(data.rating.previous14Days);

  // Parse dates (year, month, day) so date references like 2026-10-19 are valid
  function addDateNums(dateStr: string | null | undefined) {
    if (!dateStr) return;
    const parts = dateStr.match(/\d+/g);
    if (parts) {
      for (const p of parts) addNum(Number(p));
    }
  }

  addDateNums(data.generatedAt);

  // Daily & anomalies
  for (const d of data.dailyRequests) {
    addNum(d.count);
    addDateNums(d.date);
  }
  for (const a of data.anomalies) {
    addNum(a.count);
    addNum(a.zScore);
    addDateNums(a.date);
  }

  // Stuck
  addNum(data.stuck.assignedOver24h.count);
  addNum(data.stuck.openOver24h.count);
  addNum(data.stuck.inProgressOver48h.count);
  addNum(
    data.stuck.assignedOver24h.count +
      data.stuck.openOver24h.count +
      data.stuck.inProgressOver48h.count
  );
  addNum(24);
  addNum(48);
  addNum(14);
  addNum(30);

  // Invoices
  addNum(data.unpaidInvoices.count);
  addNum(data.unpaidInvoices.totalAmount);

  // Mechanics
  addNum(data.mechanics.available);
  addNum(data.mechanics.busy);
  addNum(data.mechanics.offline);
  addNum(data.mechanics.available + data.mechanics.busy + data.mechanics.offline);
  for (const m of data.mechanics.topByCompleted30d) addNum(m.completed);
  for (const l of data.mechanics.lowRated) {
    addNum(l.averageRating);
    addNum(l.reviewCount);
  }

  // Priorities & Low stock
  addNum(data.openByPriority.LOW);
  addNum(data.openByPriority.NORMAL);
  addNum(data.openByPriority.HIGH);
  addNum(data.openByPriority.EMERGENCY);
  addNum(data.lowStockItems);

  return set;
}

export function isAiTextGrounded(aiText: string, data: BackendInsightsData): boolean {
  const generatedNumbers = extractNumbersFromText(aiText);
  if (generatedNumbers.length === 0) return true;

  const validNumbers = collectAllMetricsNumbers(data);

  for (const num of generatedNumbers) {
    // Check direct equality or rounded equality (0 or 1 decimals)
    const matches =
      validNumbers.has(num) ||
      validNumbers.has(Math.round(num)) ||
      validNumbers.has(Number(num.toFixed(1)));

    if (!matches) {
      console.warn(`[AI:admin-insights] Grounding failed on unverified number: ${num}`);
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST() {
  // 1. Session & Role Check (ADMIN only)
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, code: "unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, code: "forbidden", message: "Admin role required" },
      { status: 403 }
    );
  }

  const adminId = user.id;

  // 2. Check 15-minute server instance cache
  const now = Date.now();
  if (cachedInsights && now - cachedInsights.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      data: {
        generatedAt: cachedInsights.generatedAt,
        deterministic: cachedInsights.deterministic,
        ai: cachedInsights.ai,
        meta: { source: cachedInsights.meta.source, cached: true },
        dataMetrics: cachedInsights.dataMetrics,
      },
    });
  }

  // 3. Rate limiting (4 requests per hour per admin)
  let timestamps = adminRateLimits.get(adminId) || [];
  timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_HOUR) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        code: "rate_limited",
        message: "Admin insights rate limit exceeded (maximum 4 per hour).",
      },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  // 4. Retrieve backend access token
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, code: "unauthorized", message: "Access token missing" },
      { status: 401 }
    );
  }

  // 5. Fetch GET /admin/insights from backend
  let backendInsights: BackendInsightsData;
  try {
    const res = await serverFetch<{ data: BackendInsightsData }>("/admin/insights", {
      token,
      headers: { "Cache-Control": "no-cache" },
    });
    backendInsights = res.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch backend insights";
    return NextResponse.json(
      { success: false, code: "backend_error", message: msg },
      { status: 502 }
    );
  }

  // Record rate limit hit now that we are performing fresh generation
  timestamps.push(now);
  adminRateLimits.set(adminId, timestamps);

  // 6. ALWAYS build deterministic insights
  const deterministic = buildDeterministicInsights(backendInsights);
  const generatedAt = new Date().toISOString();

  // 7. If GEMINI_API_KEY is configured, call Gemini with ANONYMIZED metrics
  let aiOutput: AiSummaryOutput | null = null;
  let source: "ai" | "rules" = "rules";

  if (env.GEMINI_API_KEY) {
    // Create strictly ANONYMIZED metrics: strip all mechanic names
    const anonymizedMetrics = {
      requests: backendInsights.requests,
      revenue: backendInsights.revenue,
      rating: backendInsights.rating,
      anomalies: backendInsights.anomalies,
      stuck: backendInsights.stuck,
      unpaidInvoices: backendInsights.unpaidInvoices,
      mechanics: {
        available: backendInsights.mechanics.available,
        busy: backendInsights.mechanics.busy,
        offline: backendInsights.mechanics.offline,
        topCompletedCount: backendInsights.mechanics.topByCompleted30d.map((m) => m.completed),
        lowRatedCount: backendInsights.mechanics.lowRated.length,
        lowRatedAverages: backendInsights.mechanics.lowRated.map((m) => m.averageRating),
      },
      openByPriority: backendInsights.openByPriority,
      lowStockItems: backendInsights.lowStockItems,
    };

    const systemPrompt = `You are the RoadResQ executive operations analyst.
Analyze the provided anonymized platform operational metrics and produce a concise, strictly factual executive summary.

REQUIREMENTS:
- headline: high-impact operational status (max 120 chars).
- summary: executive summary highlighting volumes, revenue, stuck jobs, and risks (max 500 chars).
- recommendedActions: up to 3 prioritized operational recommendations (max 140 chars each).
- CRITICAL GROUNDING RULE: Every single number or metric mentioned in your output MUST exist in the provided metrics JSON (percentages directly derived from counts are allowed). Do NOT fabricate any numbers, dates, or estimates.
- Write objectively and professionally.`;

    const aiRes = await generateJson("admin-insights", {
      system: systemPrompt,
      contents: `PLATFORM_METRICS_JSON:\n${JSON.stringify(anonymizedMetrics, null, 2)}`,
      schema: aiSummaryOutputSchema,
      maxOutputTokens: 512,
      temperature: 0.1,
      timeoutMs: 14_000,
    });

    if (aiRes.ok) {
      const fullAiText = `${aiRes.data.headline} ${aiRes.data.summary} ${aiRes.data.recommendedActions.join(" ")}`;
      // Perform strict grounding verification
      if (isAiTextGrounded(fullAiText, backendInsights)) {
        aiOutput = aiRes.data;
        source = "ai";
      } else {
        console.warn("[AI:admin-insights] AI output dropped due to grounding validation failure.");
      }
    }
  }

  // 8. Cache response for 15 minutes
  cachedInsights = {
    generatedAt,
    deterministic,
    ai: aiOutput,
    meta: { source, cached: false },
    dataMetrics: backendInsights,
    timestamp: now,
  };

  return NextResponse.json({
    success: true,
    data: {
      generatedAt,
      deterministic,
      ai: aiOutput,
      meta: { source, cached: false },
      dataMetrics: backendInsights,
    },
  });
}
