"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney } from "@/lib/format";
import { CustomerSummaryData } from "@/lib/types/users";
import { RequestStatus } from "@/lib/api/types";

// STN-7 Palette: Brand blue, Accent orange, Destructive red, and neutrals only
const STATUS_CHART_CONFIG: Record<
  RequestStatus,
  { label: string; color: string }
> = {
  COMPLETED: { label: "Completed", color: "#2563eb" }, // brand primary blue
  IN_PROGRESS: { label: "In Progress", color: "#ea580c" }, // brand accent orange
  ARRIVED: { label: "Arrived", color: "#1d4ed8" }, // brand dark blue
  EN_ROUTE: { label: "En Route", color: "#3b82f6" }, // brand light blue
  ASSIGNED: { label: "Assigned", color: "#60a5fa" }, // brand lighter blue
  SEARCHING: { label: "Searching", color: "#f97316" }, // brand lighter orange
  CANCELLED: { label: "Cancelled", color: "#dc2626" }, // brand destructive red
  PENDING: { label: "Pending", color: "#64748b" }, // neutral slate
};

interface CustomerSummaryChartsProps {
  summary: CustomerSummaryData;
}

export function CustomerSummaryCharts({ summary }: CustomerSummaryChartsProps) {
  // 1. Process requests by status for Donut Chart
  const requestsByStatus = summary?.requestsByStatus;
  const statusEntries = React.useMemo(() => {
    return requestsByStatus
      ? (Object.entries(requestsByStatus) as [RequestStatus, number][])
      : [];
  }, [requestsByStatus]);

  const donutData = React.useMemo(() => {
    return statusEntries
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        name: STATUS_CHART_CONFIG[status]?.label || status,
        value: count,
        color: STATUS_CHART_CONFIG[status]?.color || "#64748b",
      }));
  }, [statusEntries]);

  const totalRequestsCount = React.useMemo(() => {
    return statusEntries.reduce((sum, [, count]) => sum + count, 0);
  }, [statusEntries]);

  const isDonutAllZero = totalRequestsCount === 0 || donutData.length === 0;

  // 2. Process spend by month for Bar Chart
  const spendByMonth = summary?.spendByMonth;
  const barData = React.useMemo(() => {
    if (!spendByMonth) return [];
    return spendByMonth.map((item) => {
      const num = parseFloat(item.amount) || 0;
      return {
        month: item.month,
        amount: num,
        formatted: formatMoney(item.amount),
      };
    });
  }, [spendByMonth]);

  const totalSpend = React.useMemo(() => {
    return barData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [barData]);

  const isBarAllZero = totalSpend === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Donut Chart: Requests by Status */}
      <Card className="rounded-xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-primary" />
            Requests by Status
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Distribution of your platform service requests across all statuses.
          </CardDescription>
        </div>

        {isDonutAllZero ? (
          <div className="py-8">
            <EmptyState
              icon={<PieIcon className="h-6 w-6 text-muted-foreground" />}
              title="No request history yet"
              description="You have not submitted any service requests. Create a request to see your status distribution."
            />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div
              tabIndex={0}
              role="region"
              aria-label="Donut chart showing service requests grouped by status"
              className="h-56 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(val, name) => [`${val} requests`, String(name)]}
                  />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`donut-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Accessible Legend & Counts */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs pt-1 border-t border-border/50">
              {donutData.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Screen Reader accessible summary */}
            <div className="sr-only">
              <p>Total requests: {totalRequestsCount}. Breakdown: </p>
              <ul>
                {donutData.map((d) => (
                  <li key={d.status}>
                    {d.name}: {d.value} requests
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Bar Chart: Spend by Month */}
      <Card className="rounded-xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Spend
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Completed payment totals over the last 6 calendar months.
          </CardDescription>
        </div>

        {isBarAllZero ? (
          <div className="py-8">
            <EmptyState
              icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
              title="No payment history yet"
              description="No completed payments in the past 6 months. Your monthly expenses will appear here once invoices are paid."
            />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div
              tabIndex={0}
              role="region"
              aria-label="Bar chart showing monthly spending for the last 6 months"
              className="h-56 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
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
                    cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(val) => [
                      formatMoney(
                        typeof val === "number" || typeof val === "string" ? val : 0
                      ),
                      "Total Spent",
                    ]}
                    labelFormatter={(lbl) => `Month: ${String(lbl ?? "")}`}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Accessible screen reader summary */}
            <div className="sr-only">
              <p>Monthly spend summary:</p>
              <ul>
                {barData.map((d) => (
                  <li key={d.month}>
                    {d.month}: {d.formatted}
                  </li>
                ))}
              </ul>
            </div>

            {/* Total Paid Highlight */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Total Paid (6 Months):</span>
              <span className="font-mono font-bold text-foreground">
                {formatMoney(totalSpend)}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
