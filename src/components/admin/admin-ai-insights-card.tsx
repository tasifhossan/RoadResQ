"use client";

import * as React from "react";
import {
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DeterministicInsight, BackendInsightsData } from "@/lib/ai/admin-insights-rules";
import type { AiSummaryOutput } from "@/app/api/ai/admin-insights/route";
import { cn } from "@/lib/utils";

export interface AdminAiInsightsData {
  generatedAt: string;
  deterministic: DeterministicInsight[];
  ai: AiSummaryOutput | null;
  meta: { source: "ai" | "rules"; cached: boolean };
  dataMetrics?: BackendInsightsData;
}

export function AdminAiInsightsCard() {
  const [data, setData] = React.useState<AdminAiInsightsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showDataMetrics, setShowDataMetrics] = React.useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/admin-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (res.status === 429) {
        setError("Rate limit reached: Maximum 4 insights requests per hour.");
        return;
      }

      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || "Failed to generate operational insights.");
      }
    } catch {
      setError("Network error connecting to insights engine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: "action" | "watch" | "info") => {
    switch (severity) {
      case "action":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <AlertCircle className="size-3" />
            ACTION REQUIRED
          </span>
        );
      case "watch":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <AlertTriangle className="size-3" />
            WATCH
          </span>
        );
      case "info":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Info className="size-3" />
            INFO
          </span>
        );
    }
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 border-b bg-muted/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4.5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              AI Operational Insights
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated anomaly detection, operational bottleneck analysis, and Gemini summaries
          </p>
        </div>

        <Button
          onClick={fetchInsights}
          disabled={isLoading}
          size="sm"
          className="rounded-xl px-4 text-xs font-semibold shrink-0"
        >
          {isLoading ? (
            <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5 mr-1.5" />
          )}
          {data ? "Refresh insights" : "Generate insights"}
        </Button>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              className="h-7 text-xs bg-card"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Initial Empty State before generation */}
        {!data && !isLoading && !error && (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
              <Sparkles className="size-6 text-primary" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">No insights generated yet</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click &quot;Generate insights&quot; to perform a real-time operational audit covering request
              trends, delay bottlenecks, unpaid invoices, and statistical anomaly detection.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="size-8 text-primary animate-spin mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">Analyzing platform telemetry...</h4>
            <p className="text-xs text-muted-foreground">
              Evaluating 14-day request velocity, mechanic utilization, and running Gemini grounding check.
            </p>
          </div>
        )}

        {/* Data Loaded */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* AI Summary Block */}
            {data.ai ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[11px] py-0 px-2 font-semibold">
                      AI summary (Gemini)
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      Generated at {new Date(data.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground italic">
                    Strictly grounded from anonymized platform counts
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{data.ai.headline}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {data.ai.summary}
                  </p>
                </div>

                {data.ai.recommendedActions && data.ai.recommendedActions.length > 0 && (
                  <div className="pt-2 border-t border-primary/10 space-y-1.5">
                    <p className="text-[11px] font-semibold text-foreground">Recommended actions:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {data.ai.recommendedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-3.5 text-xs text-muted-foreground flex items-center justify-between">
                <span>Deterministic operational insights (AI summary unavailable or unconfigured).</span>
                <Badge variant="secondary" className="text-[10px]">
                  Rule-based
                </Badge>
              </div>
            )}

            {/* Deterministic Severity Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Operational Flags & Bottlenecks ({data.deterministic.length})
              </h4>

              {data.deterministic.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                  No unusual patterns detected. Platform running normally across all thresholds.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.deterministic.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-4 space-y-2 transition-shadow shadow-xs",
                        item.severity === "action" && "border-red-500/30 bg-red-500/5",
                        item.severity === "watch" && "border-orange-500/30 bg-orange-500/5",
                        item.severity === "info" && "border-border bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-foreground leading-snug">
                          {item.title}
                        </span>
                        {getSeverityBadge(item.severity)}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground font-mono bg-muted/60 px-2 py-0.5 rounded">
                          {item.metric}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anomaly Days List */}
            {data.dataMetrics?.anomalies && data.dataMetrics.anomalies.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Statistical Volume Anomalies (Z-Score &ge; 2)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.dataMetrics.anomalies.map((anom) => (
                    <div
                      key={anom.date}
                      className="px-3 py-1.5 rounded-xl border bg-muted/40 text-xs flex items-center gap-2"
                    >
                      <span className="font-medium text-foreground">{anom.date}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-primary font-bold">{anom.count} requests</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                        z={anom.zScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible "Data used" section */}
            {data.dataMetrics && (
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowDataMetrics(!showDataMetrics)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Database className="size-3.5" />
                    Data metrics used for analysis
                  </span>
                  {showDataMetrics ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {showDataMetrics && (
                  <div className="mt-3 p-4 rounded-xl border bg-muted/20 text-xs space-y-2 font-mono">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Reqs 14d</span>
                        <strong className="text-foreground">{data.dataMetrics.requests.last14Days}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Reqs Prev 14d</span>
                        <strong className="text-foreground">{data.dataMetrics.requests.previous14Days}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Change %</span>
                        <strong className="text-foreground">{data.dataMetrics.requests.changePct}%</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Unpaid Invoices</span>
                        <strong className="text-foreground">
                          {data.dataMetrics.unpaidInvoices.count} ({data.dataMetrics.unpaidInvoices.totalAmount} BDT)
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Mechanics</span>
                        <strong className="text-foreground">
                          {data.dataMetrics.mechanics.available} avail / {data.dataMetrics.mechanics.busy} busy
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Stuck Assigned</span>
                        <strong className="text-foreground">{data.dataMetrics.stuck.assignedOver24h.count}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Stuck Open</span>
                        <strong className="text-foreground">{data.dataMetrics.stuck.openOver24h.count}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold">Low Stock Items</span>
                        <strong className="text-foreground">{data.dataMetrics.lowStockItems}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
