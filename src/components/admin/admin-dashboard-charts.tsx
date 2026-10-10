"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatMoney } from "@/lib/format";
import { DashboardStats } from "@/lib/types/admin";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "#f59e0b" },
  SEARCHING: { label: "Searching", color: "#3b82f6" },
  ASSIGNED: { label: "Assigned", color: "#6366f1" },
  EN_ROUTE: { label: "En Route", color: "#0ea5e9" },
  ARRIVED: { label: "Arrived", color: "#06b6d4" },
  IN_PROGRESS: { label: "In Progress", color: "#8b5cf6" },
  COMPLETED: { label: "Completed", color: "#10b981" },
  CANCELLED: { label: "Cancelled", color: "#f43f5e" },
};

interface AdminDashboardChartsProps {
  data: DashboardStats;
}

export function AdminDashboardCharts({ data }: AdminDashboardChartsProps) {
  const byStatusData = React.useMemo(() => {
    if (!data?.serviceRequests?.byStatus) return [];
    return Object.entries(data.serviceRequests.byStatus).map(([status, count]) => ({
      status,
      label: statusConfig[status]?.label || status,
      count: Number(count),
      color: statusConfig[status]?.color || "#94a3b8",
    }));
  }, [data]);

  const requestsOverTimeData = React.useMemo(() => {
    if (!data?.requestsOverTime) return [];
    return data.requestsOverTime.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));
  }, [data]);

  const revenueByMonthData = React.useMemo(() => {
    if (!data?.revenueByMonth) return [];
    return data.revenueByMonth.map((item) => ({
      month: item.month,
      amount: parseFloat(item.amount) || 0,
      formatted: formatMoney(item.amount),
    }));
  }, [data]);

  const isByStatusAllZero = byStatusData.length === 0 || byStatusData.every((item) => item.count === 0);
  const isOverTimeAllZero =
    requestsOverTimeData.length === 0 || requestsOverTimeData.every((item) => item.count === 0);
  const isRevenueAllZero =
    revenueByMonthData.length === 0 || revenueByMonthData.every((item) => item.amount === 0);

  return (
    <div className="space-y-6">
      {/* Charts Row 1: Requests by Status & Requests Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Requests by Status */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Requests by Status
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Distribution of service requests across lifecycle states.
            </CardDescription>
          </div>

          <div className="mt-4">
            {isByStatusAllZero ? (
              <EmptyState
                icon={<BarChart3 className="h-6 w-6" />}
                title="No service requests recorded"
                description="Zero requests exist in the system to display status distribution."
              />
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label="Bar chart showing service requests distribution by status"
                className="h-72 w-full pt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byStatusData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      className="text-[10px] text-muted-foreground font-medium"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      className="text-xs text-muted-foreground"
                    />
                    <Tooltip
                      formatter={(val) => [val, "Requests"]}
                      labelFormatter={(lbl) => `Status: ${String(lbl ?? "")}`}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {byStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {/* Chart 2: Requests Over Time (Last 14 Days) */}
        <Card className="rounded-2xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Requests Over Time (Last 14 Days)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Daily request count trends across the last two weeks.
            </CardDescription>
          </div>

          <div className="mt-4">
            {isOverTimeAllZero ? (
              <EmptyState
                icon={<Calendar className="h-6 w-6" />}
                title="No request history"
                description="No service requests recorded during the last 14 days."
              />
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label="Area chart showing daily service request count over the last 14 days"
                className="h-72 w-full pt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={requestsOverTimeData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      angle={-30}
                      textAnchor="end"
                      tickFormatter={(val) => formatDate(val)}
                      className="text-[10px] text-muted-foreground font-medium"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      className="text-xs text-muted-foreground"
                    />
                    <Tooltip
                      formatter={(val) => [val, "Requests"]}
                      labelFormatter={(lbl) =>
                        `Date: ${formatDate(typeof lbl === "string" || typeof lbl === "number" ? lbl : String(lbl || ""))}`
                      }
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRequests)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chart 3: Revenue by Month (Last 6 Months) */}
      <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Revenue by Month (Last 6 Months)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Aggregated monthly total revenue from paid customer invoices.
          </CardDescription>
        </div>

        <div className="mt-4">
          {isRevenueAllZero ? (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title="No paid revenue history"
              description="Zero revenue recorded across the last 6 months."
            />
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-label="Bar chart showing monthly revenue over the last 6 months"
              className="h-80 w-full pt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueByMonthData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    className="text-xs text-muted-foreground font-medium"
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
                      "Paid Revenue",
                    ]}
                    labelFormatter={(lbl) => `Month: ${String(lbl ?? "")}`}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
