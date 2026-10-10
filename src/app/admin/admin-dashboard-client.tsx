"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/api/keys";
import { formatMoney } from "@/lib/format";
import { DashboardStats } from "@/lib/types/admin";
import { getDashboardStatsApi } from "@/lib/api/endpoints/admin";

// Code-split Recharts component with fixed-height skeleton fallback to prevent layout shift
const AdminDashboardCharts = dynamic(
  () => import("@/components/admin/admin-dashboard-charts").then((m) => m.AdminDashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[360px] w-full rounded-2xl" />
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[380px] w-full rounded-2xl" />
      </div>
    ),
  }
);

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

          {/* Code-Split Dynamic Charts */}
          <AdminDashboardCharts data={data} />
        </>
      )}
    </div>
  );
}
