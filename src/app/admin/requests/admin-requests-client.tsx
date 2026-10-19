"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  X,
  User,
  Wrench,
  Car,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import {
  REQUEST_STATUS_FILTER_OPTIONS,
  REQUEST_PRIORITY_FILTER_OPTIONS,
  REQUEST_SORT_BY_OPTIONS,
  REQUEST_SORT_ORDER_OPTIONS,
} from "@/lib/constants/filter-options";
import { UrlPagination } from "@/components/shared/url-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/api/keys";
import { formatDateTime } from "@/lib/format";
import { Paginated } from "@/lib/api/types";
import { AdminServiceRequestItem, GetServiceRequestsQueryInput } from "@/lib/types/admin";
import { getServiceRequestsApi } from "@/lib/api/endpoints/admin";

interface AdminRequestsClientProps {
  initialData: Paginated<AdminServiceRequestItem> | null;
  initialError: string | null;
  queryParams: GetServiceRequestsQueryInput;
}

export function AdminRequestsClient({
  initialData,
  initialError,
  queryParams,
}: AdminRequestsClientProps) {
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
  const activeQueryParams: GetServiceRequestsQueryInput = React.useMemo(() => {
    if (isDateRangeInvalid) {
      const cleanParams = { ...queryParams };
      delete cleanParams.from;
      delete cleanParams.to;
      return cleanParams;
    }
    return queryParams;
  }, [queryParams, isDateRangeInvalid]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.serviceRequests(activeQueryParams),
    queryFn: () => getServiceRequestsApi(activeQueryParams),
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
    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl);
  };

  const handleClearDates = () => {
    handleDateChange("", "");
  };

  const hasActiveFilters = Boolean(
    searchParams.get("search") ||
      searchParams.get("status") ||
      searchParams.get("priority") ||
      searchParams.get("from") ||
      searchParams.get("to") ||
      searchParams.get("sortBy") ||
      searchParams.get("sortOrder")
  );

  const handleClearAllFilters = () => {
    router.push(pathname);
  };

  const requests = data?.items || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description="Comprehensive monitoring, filtering, and operational oversight for all platform roadside assistance requests."
      />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search customer, mechanic, plate..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              paramName="status"
              label="Status"
              placeholder="Status"
              options={REQUEST_STATUS_FILTER_OPTIONS}
              className="w-36"
            />

            <FilterSelect
              paramName="priority"
              label="Priority"
              placeholder="Priority"
              options={REQUEST_PRIORITY_FILTER_OPTIONS}
              className="w-36"
            />

            <FilterSelect
              paramName="sortBy"
              label="Sort"
              placeholder="Sort By"
              options={REQUEST_SORT_BY_OPTIONS}
              defaultValue="createdAt"
              className="w-44"
            />

            <FilterSelect
              paramName="sortOrder"
              label="Order"
              placeholder="Order"
              options={REQUEST_SORT_ORDER_OPTIONS}
              defaultValue="desc"
              className="w-40"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="rounded-xl h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Date Range Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="requests-filter-from" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                From
              </label>
              <input
                id="requests-filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => handleDateChange(e.target.value, toDate)}
                className="bg-transparent border-0 text-xs text-foreground focus:outline-none focus:ring-0 p-0"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-primary/20">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="requests-filter-to" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                To
              </label>
              <input
                id="requests-filter-to"
                type="date"
                value={toDate}
                onChange={(e) => handleDateChange(fromDate, e.target.value)}
                className="bg-transparent border-0 text-xs text-foreground focus:outline-none focus:ring-0 p-0"
              />
            </div>
          </div>

          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDates}
              className="h-9 px-2.5 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear dates
            </Button>
          )}
        </div>

        {/* Invalid Date Range Warning */}
        {isDateRangeInvalid && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Invalid Date Range:</strong> &apos;From&apos; date cannot be after &apos;To&apos; date.
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load service requests"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <Card className="rounded-xl border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && requests.length === 0 && (
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title="No service requests found"
          description={
            hasActiveFilters
              ? "No service requests match the selected filters. Try clearing or broadening your search criteria."
              : "No service requests have been recorded on the platform yet."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="rounded-xl"
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Desktop Table View */}
      {!isLoading && requests.length > 0 && (
        <>
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">ID</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Mechanic</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Vehicle</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs font-medium text-foreground py-3.5">
                      <span title={req.id}>{req.id.slice(0, 10)}...</span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{req.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.mechanic ? (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{req.mechanic.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.vehicle ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground">
                            {req.vehicle.make} {req.vehicle.model}
                          </span>
                          <span className="font-mono text-muted-foreground">{req.vehicle.plateNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.priority} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(req.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {requests.map((req) => (
              <Card key={req.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    #{req.id.slice(0, 12)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Customer</span>
                    <div className="flex items-center gap-1 mt-0.5 font-medium text-foreground">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{req.customer.name}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mechanic</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {req.mechanic ? (
                        <>
                          <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate">{req.mechanic.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {req.vehicle && (
                  <div className="text-xs border-t border-border/40 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Car className="h-3.5 w-3.5 shrink-0" />
                      <span>{req.vehicle.make} {req.vehicle.model}</span>
                    </div>
                    <span className="font-mono text-foreground font-medium text-[11px] bg-muted px-1.5 py-0.5 rounded">
                      {req.vehicle.plateNumber}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex items-center justify-between">
                  <span>Created</span>
                  <span>{formatDateTime(req.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="pt-2">
              <UrlPagination meta={meta} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
