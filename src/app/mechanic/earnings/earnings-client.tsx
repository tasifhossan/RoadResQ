"use client";

import { useState } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/api/keys";
import { formatDate, formatMoney } from "@/lib/format";
import { EarningsSummary } from "@/lib/types/mechanics";
import { getEarningsSummaryApi } from "@/lib/api/endpoints/mechanics";

// Code-split Recharts component with fixed-height skeleton fallback to prevent layout shift
const MechanicEarningsChart = dynamic(
  () => import("@/components/mechanic/mechanic-earnings-chart").then((m) => m.MechanicEarningsChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[380px] w-full rounded-xl" />,
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

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoicePage, setInvoicePage] = useState(1);

  const filteredRecent = recent.filter((item) => {
    if (!invoiceSearch.trim()) return true;
    const q = invoiceSearch.toLowerCase();
    return (
      item.invoiceId.toLowerCase().includes(q) ||
      item.serviceRequestId.toLowerCase().includes(q)
    );
  });

  const invoicePageSize = 5;
  const totalInvoicePages = Math.ceil(filteredRecent.length / invoicePageSize) || 1;
  const currentInvoicePage = Math.min(invoicePage, totalInvoicePages);
  const paginatedRecent = filteredRecent.slice(
    (currentInvoicePage - 1) * invoicePageSize,
    currentInvoicePage * invoicePageSize
  );

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
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Grand Total */}
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Spare Parts Revenue
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
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
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending Payouts
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center">
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
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Completed Jobs
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-bold text-foreground">{data.completedJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">Total jobs finished successfully</p>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card className="rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Average Rating
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-orange-600 text-orange-600 dark:fill-orange-400 dark:text-orange-400" />
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
          <Card className="rounded-xl border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Recent Invoiced Jobs ({recent.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Completed requests with labor &amp; parts breakdown.
                  {recent.length > 5 ? " (showing 5 per page)" : ""}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search invoices..."
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setInvoicePage(1);
                    }}
                    className="pl-8 h-8 text-xs rounded-xl"
                    aria-label="Search recent invoices"
                  />
                </div>

                <Link href="/mechanic/requests">
                  <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs h-8">
                    View All Jobs
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {paginatedRecent.length > 0 ? (
              <div className="space-y-4">
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
                      {paginatedRecent.map((item) => (
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

                {/* Client-side Pagination Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Showing {(currentInvoicePage - 1) * invoicePageSize + 1} to{" "}
                    {Math.min(currentInvoicePage * invoicePageSize, filteredRecent.length)} of{" "}
                    {filteredRecent.length} results
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                      disabled={currentInvoicePage <= 1}
                      className="h-7 text-xs rounded-lg gap-1"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>
                    <span className="text-xs font-semibold px-2 text-foreground">
                      Page {currentInvoicePage} of {totalInvoicePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                      disabled={currentInvoicePage >= totalInvoicePages}
                      className="h-7 text-xs rounded-lg gap-1"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : recent.length > 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-semibold text-foreground">No invoices match your search</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInvoiceSearch("");
                    setInvoicePage(1);
                  }}
                  className="text-xs text-primary"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent invoiced jobs found.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
