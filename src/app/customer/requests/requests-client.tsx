"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Wrench,
  Car,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated, REQUEST_STATUSES } from "@/lib/api/types";
import { ServiceRequest, ServiceRequestListQueryInput } from "@/lib/types/service-requests";
import { getMyServiceRequestsApi } from "@/lib/api/endpoints/service-requests";

import { PageHeader } from "@/components/shared/page-header";
import { FilterSelect, FilterOption } from "@/components/shared/filter-select";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, Column } from "@/components/shared/data-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerRequestsClientProps {
  initialData: Paginated<ServiceRequest> | null;
  initialError: string | null;
  queryParams: ServiceRequestListQueryInput;
}

const STATUS_FILTER_OPTIONS: FilterOption[] = REQUEST_STATUSES.map((status) => ({
  label: status.replace("_", " "),
  value: status,
}));

const SORT_BY_OPTIONS: FilterOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Updated Date", value: "updatedAt" },
];

const SORT_ORDER_OPTIONS: FilterOption[] = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

export function CustomerRequestsClient({
  initialData,
  initialError,
  queryParams,
}: CustomerRequestsClientProps) {
  const router = useRouter();

  // TanStack Query for list fetching with initialData
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.my(queryParams),
    queryFn: () => getMyServiceRequestsApi(queryParams),
    initialData: initialData ?? undefined,
  });

  const requestsList = data?.items ?? [];
  const meta = data?.meta;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // DataTable columns definition for desktop view
  const columns: Column<ServiceRequest>[] = [
    {
      key: "id",
      header: "Request & Vehicle",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              #{item.id.slice(-6).toUpperCase()}
            </p>
            {item.vehicle ? (
              <p className="text-xs text-muted-foreground">
                {item.vehicle.make} {item.vehicle.model} ({item.vehicle.plateNumber})
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No vehicle specified</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (item) => <StatusBadge status={item.priority} />,
    },
    {
      key: "mechanic",
      header: "Assigned Mechanic",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          {item.mechanic ? (
            <span className="font-medium text-foreground">{item.mechanic.name}</span>
          ) : (
            <span className="text-muted-foreground text-xs italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (item) => (
        <Link href={`/customer/requests/${item.id}`}>
          <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-xs">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Requests"
        description="View and track your roadside assistance service requests."
      >
        <Link href="/customer/requests/new">
          <Button className="rounded-xl gap-2 shadow-sm font-medium">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </PageHeader>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            paramName="status"
            placeholder="All Statuses"
            allLabel="All Statuses"
            options={STATUS_FILTER_OPTIONS}
            className="w-full sm:w-44"
          />

          <FilterSelect
            paramName="sortBy"
            placeholder="Sort by"
            allLabel="Sort by Created Date"
            options={SORT_BY_OPTIONS}
            className="w-full sm:w-44"
          />

          <FilterSelect
            paramName="sortOrder"
            placeholder="Order"
            allLabel="Newest First"
            options={SORT_ORDER_OPTIONS}
            className="w-full sm:w-40"
          />
        </div>

        {meta && (
          <p className="text-xs text-muted-foreground text-right sm:text-left">
            Total: <span className="font-semibold text-foreground">{meta.total}</span> requests
          </p>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <DataTable columns={columns} data={[]} isLoading={true} />
      ) : isError || initialError ? (
        <ErrorState
          title="Could not load requests"
          description={
            error instanceof Error
              ? error.message
              : initialError || "An error occurred while fetching your service requests."
          }
          onRetry={() => refetch()}
        />
      ) : requestsList.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-8 w-8 text-muted-foreground" />}
          title={queryParams.status ? "No matching requests" : "No service requests yet"}
          description={
            queryParams.status
              ? `No service requests found with status "${queryParams.status}". Try selecting another filter.`
              : "You haven't submitted any roadside assistance requests yet."
          }
          action={
            <Link href="/customer/requests/new">
              <Button className="rounded-xl gap-2 mt-2 shadow-sm">
                <Plus className="h-4 w-4" />
                Request Assistance
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="block sm:hidden space-y-4">
            {requestsList.map((item) => (
              <Card
                key={item.id}
                onClick={() => router.push(`/customer/requests/${item.id}`)}
                className="rounded-2xl border-border shadow-sm overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Request #{item.id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </CardHeader>

                <CardContent className="space-y-3 pt-0 pb-4">
                  {/* Vehicle details */}
                  <div className="flex items-center justify-between text-xs bg-muted/30 p-2.5 rounded-xl border border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Car className="h-3.5 w-3.5 text-primary" />
                      Vehicle:
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.vehicle
                        ? `${item.vehicle.make} ${item.vehicle.model}`
                        : "No vehicle"}
                    </span>
                  </div>

                  {/* Mechanic details & Priority */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{item.mechanic ? item.mechanic.name : "Unassigned"}</span>
                    </div>
                    <StatusBadge status={item.priority} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View: DataTable */}
          <div className="hidden sm:block">
            <DataTable
              data={requestsList}
              columns={columns}
              onRowClick={(item) => router.push(`/customer/requests/${item.id}`)}
            />
          </div>

          {/* Pagination */}
          {meta && <UrlPagination meta={meta} />}
        </>
      )}
    </div>
  );
}
