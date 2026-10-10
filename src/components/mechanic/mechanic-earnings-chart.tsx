"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney } from "@/lib/format";
import { EarningsSummary } from "@/lib/types/mechanics";

interface MechanicEarningsChartProps {
  monthly: EarningsSummary["monthly"];
}

export function MechanicEarningsChart({ monthly }: MechanicEarningsChartProps) {
  const chartData = (monthly ?? []).map((m) => {
    const labor = parseFloat(m.laborTotal) || 0;
    const parts = parseFloat(m.partsTotal) || 0;
    return {
      month: m.month,
      labor,
      parts,
      total: labor + parts,
      jobs: m.jobs,
    };
  });

  const isChartAllZero = chartData.every((m) => m.labor === 0 && m.parts === 0);

  return (
    <Card className="rounded-2xl border-border bg-card p-6 shadow-sm space-y-4">
      <div>
        <CardTitle className="text-lg font-bold">6-Month Earnings Breakdown</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Stacked monthly totals comparing labor revenue and spare parts revenue.
        </CardDescription>
      </div>

      {isChartAllZero ? (
        <EmptyState
          icon={<DollarSign className="h-6 w-6" />}
          title="No earnings history yet"
          description="Zero earnings recorded over the last 6 months. Complete service requests to see your revenue breakdown."
        />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-label="Stacked Bar Chart showing 6-month earnings breakdown for labor and parts"
          className="h-80 w-full pt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs text-muted-foreground"
                tickFormatter={(val: number) => `BDT ${val}`}
              />
              <Tooltip
                formatter={(val) => [
                  formatMoney(typeof val === "number" || typeof val === "string" ? val : 0),
                  "Revenue",
                ]}
                labelFormatter={(lbl) => `Month: ${String(lbl ?? "")}`}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(val) => (
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {val === "labor" ? "Labor Revenue" : "Spare Parts Revenue"}
                  </span>
                )}
              />
              <Bar dataKey="labor" stackId="a" fill="#2563eb" radius={[0, 0, 4, 4]} />
              <Bar dataKey="parts" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
