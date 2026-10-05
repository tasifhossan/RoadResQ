"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import {
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  ExternalLink,
  Receipt,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/api/keys";
import { formatDate, formatMoney } from "@/lib/format";
import { EarningsSummary } from "@/lib/types/mechanics";
import { getEarningsSummaryApi } from "@/lib/api/endpoints/mechanics";

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

  const chartData = monthly.map((m) => {
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

          {/* Recharts Stacked Bar Chart */}
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
                      tickFormatter={(val: number) => `$${val}`}
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
                      verticalAlign="top"
                      height={36}
                      formatter={(value: string) =>
                        value === "labor" ? "Labor Revenue" : "Parts Revenue"
                      }
                    />
                    <Bar
                      dataKey="labor"
                      stackId="a"
                      fill="var(--color-primary, #2563eb)"
                      name="labor"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="parts"
                      stackId="a"
                      fill="#10b981"
                      name="parts"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Recent Paid Invoices Table */}
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Paid Invoices
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Showing your last 10 paid job invoices with direct links to job details.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<Receipt className="h-6 w-6" />}
                    title="No paid invoices found"
                    description="You don't have any paid invoices recorded yet."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold">Invoice ID</TableHead>
                        <TableHead className="font-semibold">Job / Request</TableHead>
                        <TableHead className="font-semibold">Paid Date</TableHead>
                        <TableHead className="font-semibold text-right">Amount Paid</TableHead>
                        <TableHead className="font-semibold text-right">View Job</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recent.map((inv) => (
                        <TableRow key={inv.invoiceId} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {inv.invoiceId.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            <span className="font-mono text-xs">{inv.serviceRequestId.slice(0, 8)}...</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(inv.paidAt)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {formatMoney(inv.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/mechanic/requests/${inv.serviceRequestId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl h-8 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                              >
                                View Job
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
