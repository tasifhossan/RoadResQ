"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  RotateCcw,
  Calendar,
  User,
  FileSpreadsheet,
  AlertCircle,
  Receipt,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect } from "@/components/shared/filter-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  PAYMENT_STATUS_FILTER_OPTIONS,
  PAYMENT_SORT_BY_OPTIONS,
  PAYMENT_SORT_ORDER_OPTIONS,
} from "@/lib/constants/filter-options";
import { queryKeys } from "@/lib/api/keys";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { Paginated } from "@/lib/api/types";
import { AdminPaymentItem, GetPaymentsQueryInput } from "@/lib/types/admin";
import { getPaymentsApi } from "@/lib/api/endpoints/admin";

interface AdminPaymentsClientProps {
  initialData: Paginated<AdminPaymentItem> | null;
  initialError: string | null;
  queryParams: GetPaymentsQueryInput;
}

export function AdminPaymentsClient({
  initialData,
  initialError,
  queryParams,
}: AdminPaymentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local date filter state synced with URL searchParams
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";

  const [fromDate, setFromDate] = useState(fromParam);
  const [toDate, setToDate] = useState(toParam);

  const [prevFrom, setPrevFrom] = useState(fromParam);
  const [prevTo, setPrevTo] = useState(toParam);

  if (fromParam !== prevFrom) {
    setPrevFrom(fromParam);
    setFromDate(fromParam);
  }
  if (toParam !== prevTo) {
    setPrevTo(toParam);
    setToDate(toParam);
  }

  // Date range validation
  const isDateRangeInvalid = Boolean(
    fromDate && toDate && new Date(fromDate) > new Date(toDate)
  );

  // Construct active query for TanStack query (suppress invalid date range)
  const activeQueryParams: GetPaymentsQueryInput = React.useMemo(() => {
    if (isDateRangeInvalid) {
      const cleanParams = { ...queryParams };
      delete cleanParams.from;
      delete cleanParams.to;
      return cleanParams;
    }
    return queryParams;
  }, [queryParams, isDateRangeInvalid]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.payments(activeQueryParams),
    queryFn: () => getPaymentsApi(activeQueryParams),
    initialData: initialData ?? undefined,
    enabled: !isDateRangeInvalid,
  });

  const handleDateChange = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);

    const params = new URLSearchParams(searchParams.toString());
    if (newFrom) {
      params.set("from", newFrom);
    } else {
      params.delete("from");
    }

    if (newTo) {
      params.set("to", newTo);
    } else {
      params.delete("to");
    }

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    searchParams.get("status") ||
      searchParams.get("from") ||
      searchParams.get("to") ||
      searchParams.get("sortBy") ||
      searchParams.get("sortOrder")
  );

  const payments = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor platform billing transactions, invoices, and payment statuses."
      />

      {/* Filters and Controls */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <FilterSelect
              paramName="status"
              label="Status"
              options={PAYMENT_STATUS_FILTER_OPTIONS}
              placeholder="Status"
              className="w-full"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="payments-filter-from" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                From
              </label>
              <input
                id="payments-filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => handleDateChange(e.target.value, toDate)}
                className="bg-transparent border-0 text-xs text-foreground focus:outline-none focus:ring-0 p-0"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="payments-filter-to" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                To
              </label>
              <input
                id="payments-filter-to"
                type="date"
                value={toDate}
                onChange={(e) => handleDateChange(fromDate, e.target.value)}
                className="bg-transparent border-0 text-xs text-foreground focus:outline-none focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Sort By & Order */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="w-44">
              <FilterSelect
                paramName="sortBy"
                label="Sort"
                options={PAYMENT_SORT_BY_OPTIONS}
                defaultValue="createdAt"
                showAllOption={false}
                placeholder="Sort by"
                className="w-full"
              />
            </div>
            <div className="w-40">
              <FilterSelect
                paramName="sortOrder"
                label="Order"
                options={PAYMENT_SORT_ORDER_OPTIONS}
                defaultValue="desc"
                showAllOption={false}
                placeholder="Order"
                className="w-full"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1.5 text-xs h-9"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Date Validation Notice */}
        {isDateRangeInvalid && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>&quot;From&quot; date cannot be later than &quot;To&quot; date. Please adjust your range.</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ) : isError || initialError ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ErrorState
            title="Failed to load payment transactions"
            description={
              error instanceof Error
                ? error.message
                : initialError || "An error occurred while loading payments. Please try again."
            }
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <EmptyState
            icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
            title="No payments found"
            description={
              hasActiveFilters
                ? "No payments match the chosen filters. Try resetting the status or date range."
                : "No payment transactions have been recorded in the system yet."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <th className="px-4 py-3.5">Payment / Date</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Request Ref</th>
                    <th className="px-4 py-3.5">Invoice Total</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-normal text-foreground">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
                    >
                      {/* Payment ID & Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-semibold text-foreground block">
                              {payment.id.slice(0, 8)}...
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {formatDateTime(payment.createdAt)}
                            </span>
                            {payment.paidAt && (
                              <span className="text-[10px] text-muted-foreground block font-mono">
                                Paid: {formatDateTime(payment.paidAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">
                            {payment.customer?.name || "Customer"}
                          </span>
                        </div>
                      </td>

                      {/* Request Ref */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/requests?search=${payment.serviceRequest.id.slice(0, 8)}`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-primary hover:underline"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          #{payment.serviceRequest.id.slice(0, 8)}
                        </Link>
                      </td>

                      {/* Invoice Total */}
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatMoney(payment.invoice?.total)}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {formatMoney(payment.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
              >
                {/* Header: ID, Date & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{payment.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>

                {/* Amount Highlight */}
                <div className="flex items-center justify-between border-y border-border py-2 text-xs">
                  <span className="text-muted-foreground font-medium">Payment Amount</span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatMoney(payment.amount)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block text-muted-foreground">
                      Customer
                    </span>
                    <span className="font-medium text-foreground truncate block">
                      {payment.customer?.name || "Customer"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider block text-muted-foreground">
                      Invoice Total
                    </span>
                    <span className="font-mono font-medium text-foreground block">
                      {formatMoney(payment.invoice?.total)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider block text-muted-foreground">
                      Service Request
                    </span>
                    <Link
                      href={`/admin/requests?search=${payment.serviceRequest.id.slice(0, 8)}`}
                      className="font-mono text-primary hover:underline truncate block"
                    >
                      #{payment.serviceRequest.id.slice(0, 8)}
                    </Link>
                  </div>

                  {payment.paidAt && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block text-muted-foreground">
                        Paid At
                      </span>
                      <span className="text-[11px] font-mono text-foreground block">
                        {formatDate(payment.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && <UrlPagination meta={meta} />}
        </div>
      )}
    </div>
  );
}
