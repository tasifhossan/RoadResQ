"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Car,
  ArrowRight,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated } from "@/lib/api/types";
import { GetMyPaymentsQueryInput, MyPaymentItem } from "@/lib/types/payments";
import { getMyPaymentsApi } from "@/lib/api/endpoints/payments";
import { formatMoney, formatDate } from "@/lib/format";

import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect } from "@/components/shared/filter-select";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, Column } from "@/components/shared/data-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CustomerPaymentsClientProps {
  initialData: Paginated<MyPaymentItem> | null;
  initialError: string | null;
  queryParams: GetMyPaymentsQueryInput;
}

import { PAYMENT_STATUS_FILTER_OPTIONS } from "@/lib/constants/filter-options";

export function CustomerPaymentsClient({
  initialData,
  initialError,
  queryParams,
}: CustomerPaymentsClientProps) {
  const router = useRouter();

  // TanStack Query for list fetching with initialData
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.payments.my(queryParams),
    queryFn: () => getMyPaymentsApi(queryParams),
    initialData: initialData ?? undefined,
  });

  const paymentsList = data?.items ?? [];
  const meta = data?.meta;

  // DataTable columns definition for desktop view
  const columns: Column<MyPaymentItem>[] = [
    {
      key: "createdAt",
      header: "Payment Date",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground block">
              {formatDate(item.createdAt)}
            </span>
            {item.paidAt && (
              <span className="text-[10px] text-muted-foreground block font-mono">
                Paid: {formatDate(item.paidAt)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item) => (
        <span className="font-mono font-bold text-foreground text-sm">
          {formatMoney(item.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "invoiceBreakdown",
      header: "Invoice Breakdown",
      cell: (item) => (
        <div className="text-xs space-y-0.5 font-mono">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Labor: {formatMoney(item.invoice.laborCost)}</span>
            <span>•</span>
            <span>Parts: {formatMoney(item.invoice.partsCost)}</span>
          </div>
          <div className="font-semibold text-foreground">
            Total: {formatMoney(item.invoice.total)}
          </div>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Car className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {item.serviceRequest?.vehicle ? (
            <span className="font-medium text-foreground">
              {item.serviceRequest.vehicle.make} {item.serviceRequest.vehicle.model} ({item.serviceRequest.vehicle.plateNumber})
            </span>
          ) : (
            <span className="text-muted-foreground italic">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (item) => (
        item.serviceRequest ? (
          <Link href={`/customer/requests/${item.serviceRequest.id}`}>
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs">
              View Request
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payment History"
        description="View payment transactions and invoice breakdowns for your service requests."
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            paramName="status"
            placeholder="All Payment Statuses"
            allLabel="All Payment Statuses"
            options={PAYMENT_STATUS_FILTER_OPTIONS}
            className="w-full sm:w-52"
          />
        </div>

        {meta && (
          <p className="text-xs text-muted-foreground text-right sm:text-left font-medium">
            Total: <span className="font-semibold text-foreground">{meta.total}</span> payments
          </p>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <DataTable columns={columns} data={[]} isLoading={true} />
      ) : isError || initialError ? (
        <ErrorState
          title="Could not load payment history"
          description={
            error instanceof Error
              ? error.message
              : initialError || "An error occurred while fetching your payment history."
          }
          onRetry={() => refetch()}
        />
      ) : paymentsList.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-8 w-8 text-muted-foreground" />}
          title={queryParams.status ? "No matching payments" : "No payment history yet"}
          description={
            queryParams.status
              ? `No payments found with status "${queryParams.status}". Try clearing the filter.`
              : "You haven't made any payments for roadside assistance services yet."
          }
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="block sm:hidden space-y-4">
            {paymentsList.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl border-border shadow-sm overflow-hidden"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 bg-muted/20">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="font-mono font-bold text-lg text-foreground block mt-0.5">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </CardHeader>

                <CardContent className="space-y-3 pt-3 pb-4 text-xs">
                  {/* Vehicle Details */}
                  {item.serviceRequest?.vehicle && (
                    <div className="flex items-center justify-between bg-card p-2.5 rounded-xl border border-border">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Car className="h-3.5 w-3.5 text-primary" />
                        Vehicle:
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.serviceRequest.vehicle.make} {item.serviceRequest.vehicle.model} ({item.serviceRequest.vehicle.plateNumber})
                      </span>
                    </div>
                  )}

                  {/* Invoice Breakdown */}
                  <div className="space-y-1 bg-muted/30 p-2.5 rounded-xl border border-border/60">
                    <span className="font-semibold text-foreground block mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Invoice Breakdown
                    </span>
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>Labor Cost:</span>
                      <span>{formatMoney(item.invoice.laborCost)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-mono">
                      <span>Parts Cost:</span>
                      <span>{formatMoney(item.invoice.partsCost)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border/50 font-mono">
                      <span>Total Invoice:</span>
                      <span>{formatMoney(item.invoice.total)}</span>
                    </div>
                  </div>

                  {/* View Request Link */}
                  {item.serviceRequest && (
                    <div className="pt-1 flex justify-end">
                      <Link href={`/customer/requests/${item.serviceRequest.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs w-full">
                          View Service Request
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View: DataTable */}
          <div className="hidden sm:block">
            <DataTable
              data={paymentsList}
              columns={columns}
              onRowClick={(item) => {
                if (item.serviceRequest) {
                  router.push(`/customer/requests/${item.serviceRequest.id}`);
                }
              }}
            />
          </div>

          {/* Pagination */}
          {meta && <UrlPagination meta={meta} />}
        </>
      )}
    </div>
  );
}
