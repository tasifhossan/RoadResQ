"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Receipt,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/api/keys";
import { formatDate, formatMoney } from "@/lib/format";
import { EarningsSummary } from "@/lib/types/mechanics";
import { getEarningsSummaryApi } from "@/lib/api/endpoints/mechanics";

// Code-split Recharts component with fixed-height skeleton fallback to prevent layout shift
const MechanicEarningsChart = dynamic(
  () => import("@/components/mechanic/mechanic-earnings-chart").then((m) => m.MechanicEarningsChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[380px] w-full rounded-2xl" />,
  }
);

interface EarningsClientProps {
  initialData: EarningsSummary | null;
  initialError: string | null;
}

export function EarningsClient({ initialData, initialError }: EarningsClientProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.mechanics.earnings(),
    queryFn: getEarningsSummaryApi,
    initialData: initialData ?? undefined,
  });

  const totals = data?.totals;
  const monthly = data?.monthly ?? [];
  const recent = data?.recent ?? [];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Earnings & Performance"
        description="Track your revenue from completed jobs, pending payouts, and 6-month earnings trend."
      />

      {/* Error state */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load earnings summary"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading state */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Grand Total */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Grand Total Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {formatMoney(totals?.grandTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total earnings from paid jobs</p>
              </CardContent>
            </Card>

            {/* Labor Total */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Labor Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {formatMoney(totals?.laborTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Earnings from labor & service fees</p>
              </CardContent>
            </Card>

            {/* Parts Total */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Spare Parts Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Coins className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {formatMoney(totals?.partsTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Earnings from parts used on jobs</p>
              </CardContent>
            </Card>

            {/* Pending Amount */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending Payouts
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {formatMoney(data.pendingAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed jobs awaiting customer payment</p>
              </CardContent>
            </Card>

            {/* Completed Jobs */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Completed Jobs
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">{data.completedJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">Total jobs finished successfully</p>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Average Rating
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {data.averageRating.toFixed(1)} / 5.0
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on customer job reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Code-Split Dynamic Stacked Bar Chart */}
          <MechanicEarningsChart monthly={monthly} />

          {/* Recent Completed Invoices / Jobs Table */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Recent Invoiced Jobs
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Completed requests with labor & parts breakdown.
                </CardDescription>
              </div>

              <Link href="/mechanic/requests">
                <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs">
                  View All Jobs
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent invoiced jobs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Invoice ID</TableHead>
                      <TableHead className="text-xs">Service Request ID</TableHead>
                      <TableHead className="text-xs">Total Amount</TableHead>
                      <TableHead className="text-xs">Paid Date</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((item) => (
                      <TableRow key={item.invoiceId}>
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          {item.invoiceId.slice(-8)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.serviceRequestId.slice(-8)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground">
                          {formatMoney(item.total)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(item.paidAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/mechanic/requests/${item.serviceRequestId}`}>
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs">
                              Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
