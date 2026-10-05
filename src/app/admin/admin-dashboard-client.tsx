"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import {
  Users,
  UserCheck,
  Wrench,
  Shield,
  Activity,
  CheckCircle2,
  TrendingUp,
  FileText,
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/api/keys";
import { formatDate, formatMoney } from "@/lib/format";
import { DashboardStats } from "@/lib/types/admin";
import { getDashboardStatsApi } from "@/lib/api/endpoints/admin";

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

interface AdminDashboardClientProps {
  initialData: DashboardStats | null;
  initialError: string | null;
  displayName: string;
}

export function AdminDashboardClient({
  initialData,
  initialError,
  displayName,
}: AdminDashboardClientProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: getDashboardStatsApi,
    initialData: initialData ?? undefined,
  });

  // Prepare chart data safely
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
    <div className="space-y-6 pb-12">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="System-wide statistics, request metrics, revenue analytics, and admin management quick links."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-medium">
              <Users className="h-4 w-4 text-primary" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Audit Logs
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Error State */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load admin dashboard statistics"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  System Users
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {data.users.total}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 pt-1">
                  <span>Cust: <strong className="text-foreground font-semibold">{data.users.customers}</strong></span>
                  <span>•</span>
                  <span>Mech: <strong className="text-foreground font-semibold">{data.users.mechanics}</strong></span>
                  <span>•</span>
                  <span>Admin: <strong className="text-foreground font-semibold">{data.users.admins}</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Total Service Requests */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Service Requests
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {data.serviceRequests.total}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Total roadside assistance requests
                </p>
              </CardContent>
            </Card>

            {/* Completed Jobs */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Completed Jobs
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {data.serviceRequests.completedJobs}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Finished jobs by mechanics
                </p>
              </CardContent>
            </Card>

            {/* Total Paid Revenue */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paid Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {formatMoney(data.revenue.totalPaidAmount)}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Aggregated paid invoice volume
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Role Quick Distribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/users?role=CUSTOMER">
              <Card className="rounded-2xl border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Customers</div>
                      <div className="text-lg font-bold text-foreground">{data.users.customers}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users?role=MECHANIC">
              <Card className="rounded-2xl border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Mechanics</div>
                      <div className="text-lg font-bold text-foreground">{data.users.mechanics}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users?role=ADMIN">
              <Card className="rounded-2xl border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Admins</div>
                      <div className="text-lg font-bold text-foreground">{data.users.admins}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Charts Row 1: Requests by Status & Requests Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Requests by Status (Recharts Bar) */}
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
        </>
      )}
    </div>
  );
}
