"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ChevronRight,
  User,
  Car,
  Calendar,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated, REQUEST_STATUSES, RequestStatus } from "@/lib/api/types";
import { ServiceRequest, ServiceRequestListQueryInput } from "@/lib/types/service-requests";
import { getAssignedServiceRequestsApi } from "@/lib/api/endpoints/service-requests";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataTable, Column } from "@/components/shared/data-table";
import { UrlPagination } from "@/components/shared/url-pagination";
import { FilterSelect } from "@/components/shared/filter-select";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JobsListClientProps {
  initialData: Paginated<ServiceRequest> | null;
  initialError: string | null;
  queryParams: ServiceRequestListQueryInput;
}

export function JobsListClient({
  initialData,
  initialError,
  queryParams,
}: JobsListClientProps) {
  const router = useRouter();

  const statusParam = (queryParams.status as RequestStatus) || "";
  const pageParam = queryParams.page || 1;
  const limitParam = queryParams.limit || 10;
  const sortByParam = queryParams.sortBy || "createdAt";
  const sortOrderParam = queryParams.sortOrder || "desc";

  // TanStack Query for assigned jobs list
  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.assigned({
      page: pageParam,
      limit: limitParam,
      status: statusParam || undefined,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
    }),
    queryFn: () =>
      getAssignedServiceRequestsApi({
        page: pageParam,
        limit: limitParam,
        status: statusParam || undefined,
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
      }),
    initialData: initialData ?? undefined,
  });

  if (isError || initialError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to load jobs"
          description={
            (error instanceof Error ? error.message : initialError) ||
            "An error occurred while fetching assigned service requests."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const items = jobsData?.items || initialData?.items || [];
  const meta = jobsData?.meta || initialData?.meta;

  const columns: Column<ServiceRequest>[] = [
    {
      key: "description",
      header: "Issue & Priority",
      cell: (req) => (
        <div className="space-y-1 max-w-xs">
          <p className="font-semibold text-foreground text-sm line-clamp-2">
            {req.description}
          </p>
          <div className="flex items-center gap-2">
            <StatusBadge status={req.priority} />
            <span className="text-[11px] text-muted-foreground font-mono">
              #{req.id.slice(-6)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (req) =>
        req.customer ? (
          <div className="space-y-0.5 text-xs">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {req.customer.name}
            </p>
            {req.customer.phone && (
              <p className="text-muted-foreground pl-4.5">{req.customer.phone}</p>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (req) =>
        req.vehicle ? (
          <div className="space-y-0.5 text-xs">
            <p className="font-medium text-foreground flex items-center gap-1">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              {req.vehicle.make} {req.vehicle.model}
            </p>
            <p className="text-muted-foreground font-mono uppercase pl-4.5">
              {req.vehicle.plateNumber}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None specified</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (req) => <StatusBadge status={req.status} />,
    },
    {
      key: "createdAt",
      header: "Requested",
      cell: (req) => (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(req.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (req) => (
        <Link
          href={`/mechanic/requests/${req.id}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-xl gap-1 text-xs font-semibold text-primary"
          )}
        >
          View Job
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Assigned Jobs"
        description="View and manage roadside assistance requests assigned to you."
      />

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>

          <FilterSelect
            paramName="status"
            placeholder="All Statuses"
            allLabel="All Statuses"
            options={REQUEST_STATUSES.map((status) => ({
              label: status.replace("_", " "),
              value: status,
            }))}
            className="w-[170px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">Sort:</span>
          <FilterSelect
            paramName="sortBy"
            placeholder="Sort by"
            defaultValue="createdAt"
            showAllOption={false}
            options={[
              { label: "Newest First", value: "createdAt" },
              { label: "Recently Updated", value: "updatedAt" },
            ]}
            className="w-[170px]"
          />
        </div>
      </div>

      {/* Main Content: Desktop Table & Mobile Cards */}
      {isLoading ? (
        <div className="space-y-4 p-6 bg-card rounded-2xl border">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : items.length > 0 ? (
        <>
          {/* Desktop Data Table */}
          <div className="hidden md:block bg-card rounded-2xl border shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={items}
              onRowClick={(req) => router.push(`/mechanic/requests/${req.id}`)}
            />
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-4">
            {items.map((req) => (
              <Card
                key={req.id}
                className="rounded-2xl border shadow-sm overflow-hidden hover:bg-muted/10 transition-colors"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 max-w-[220px]">
                      <h4 className="font-bold text-base text-foreground line-clamp-2">
                        {req.description}
                      </h4>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.priority} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{req.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                    {req.customer && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          {req.customer.name} {req.customer.phone ? `(${req.customer.phone})` : ""}
                        </span>
                      </div>
                    )}

                    {req.vehicle && (
                      <div className="flex items-center gap-2">
                        <Car className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {req.vehicle.make} {req.vehicle.model} ({req.vehicle.plateNumber})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {req.lat.toFixed(4)}, {req.lng.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/mechanic/requests/${req.id}`}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "rounded-xl gap-1.5 text-xs font-semibold w-full justify-center"
                      )}
                    >
                      View Job Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* URL-synced Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <UrlPagination meta={meta} />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No jobs found"
          description={
            statusParam
              ? `No service requests found with status "${statusParam}".`
              : "You currently have no service requests assigned."
          }
          icon={<Wrench className="h-6 w-6 text-muted-foreground" />}
        />
      )}
    </div>
  );
}
