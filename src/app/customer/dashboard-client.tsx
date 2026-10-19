"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Car,
  Wrench,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapPin,
  Calendar,
  Search,
} from "lucide-react";

import dynamic from "next/dynamic";
import { queryKeys } from "@/lib/api/keys";
import { Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import { Vehicle } from "@/lib/types/vehicles";
import { ServiceRequest } from "@/lib/types/service-requests";
import { CustomerSummaryData } from "@/lib/types/users";
import { getMyVehiclesApi } from "@/lib/api/endpoints/vehicles";
import { getMyServiceRequestsApi } from "@/lib/api/endpoints/service-requests";
import { getMySummaryApi } from "@/lib/api/endpoints/users";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CustomerSummaryCharts = dynamic(
  () =>
    import("@/components/customer/customer-summary-charts").then(
      (mod) => mod.CustomerSummaryCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 rounded-xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </Card>
        <Card className="h-80 rounded-xl border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </Card>
      </div>
    ),
  }
);

interface DashboardClientProps {
  initialUser: UserProfile | null;
  initialVehicles: Paginated<Vehicle> | null;
  initialRequests: Paginated<ServiceRequest> | null;
  initialSummary: CustomerSummaryData | null;
}

export function DashboardClient({
  initialUser,
  initialVehicles,
  initialRequests,
  initialSummary,
}: DashboardClientProps) {
  // TanStack Query for customer summary data
  const { data: summaryData } = useQuery({
    queryKey: queryKeys.users.summary(),
    queryFn: () => getMySummaryApi(),
    initialData: initialSummary ?? undefined,
  });

  // TanStack Query for vehicles (to keep vehicle count updated)
  const { data: vehiclesData } = useQuery({
    queryKey: queryKeys.vehicles.list({ limit: 1 }),
    queryFn: () => getMyVehiclesApi({ limit: 1 }),
    initialData: initialVehicles ?? undefined,
  });

  // TanStack Query for service requests
  const { data: requestsData } = useQuery({
    queryKey: queryKeys.serviceRequests.my({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
    queryFn: () => getMyServiceRequestsApi({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
    initialData: initialRequests ?? undefined,
  });

  const vehiclesMeta = vehiclesData?.meta || initialVehicles?.meta;
  const vehicleCount = vehiclesMeta?.total ?? 0;

  const requestItems = useMemo(
    () => requestsData?.items || initialRequests?.items || [],
    [requestsData?.items, initialRequests?.items]
  );

  // Active request: latest non-terminal request (not COMPLETED and not CANCELLED)
  const activeRequest = requestItems.find(
    (req) => req.status !== "COMPLETED" && req.status !== "CANCELLED"
  );

  // Client-side filtering & pagination for Recent Requests
  const [requestSearch, setRequestSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [requestPage, setRequestPage] = useState(1);

  const filteredRequests = useMemo(() => {
    return requestItems.filter((req) => {
      const q = requestSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        req.description.toLowerCase().includes(q) ||
        Boolean(req.vehicle?.make && req.vehicle.make.toLowerCase().includes(q)) ||
        Boolean(req.vehicle?.model && req.vehicle.model.toLowerCase().includes(q)) ||
        Boolean(req.vehicle?.plateNumber && req.vehicle.plateNumber.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requestItems, requestSearch, statusFilter]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(requestPage, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const userName = initialUser?.name || "Customer";

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Top Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={`Welcome back, ${userName}`}
          description="Overview of your active roadside assistance requests and registered vehicles."
        />

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/customer/vehicles"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl gap-2 shadow-sm")}
          >
            <Car className="h-4 w-4 text-primary" />
            Add Vehicle
          </Link>

          <Link
            href="/customer/requests/new"
            className={cn(buttonVariants({ variant: "default" }), "rounded-xl gap-2 shadow-sm font-medium")}
          >
            <PlusCircle className="h-4 w-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Top Cards Grid: Active Request & Vehicle Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Request Card (Spans 2 columns on medium screens) */}
        <Card className="md:col-span-2 rounded-xl border-border shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/30 border-b border-border py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold">Active Assistance Request</CardTitle>
              </div>
              {activeRequest && <StatusBadge status={activeRequest.status} />}
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-6 flex flex-col justify-center">
            {activeRequest ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">
                      {activeRequest.description}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Requested on {new Date(activeRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/customer/requests/${activeRequest.id}`}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl gap-1.5 self-start sm:self-auto")}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {activeRequest.vehicle && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                      <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium text-xs text-muted-foreground block">Vehicle</span>
                        <span className="font-medium">
                          {activeRequest.vehicle.make} {activeRequest.vehicle.model} ({activeRequest.vehicle.plateNumber})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-xs text-muted-foreground block">Location Coordinates</span>
                      <span className="font-medium truncate block">
                        {activeRequest.lat.toFixed(4)}, {activeRequest.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No active service requests"
                description="Everything is running smoothly! Need emergency roadside assistance?"
                icon={<Wrench className="h-6 w-6 text-muted-foreground" />}
                action={
                  <Link
                    href="/customer/requests/new"
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl gap-2")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Request Assistance
                  </Link>
                }
                className="my-0 py-6 border-none bg-transparent"
              />
            )}
          </CardContent>
        </Card>

        {/* Vehicle Count Summary Card */}
        <Card className="rounded-xl border-border shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Registered Vehicles</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center justify-center text-center my-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-3 shadow-inner">
              {vehicleCount}
            </div>
            <p className="text-sm font-medium text-foreground">
              {vehicleCount === 1 ? "1 vehicle registered" : `${vehicleCount} vehicles registered`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Keep vehicle details updated for faster assistance dispatch.
            </p>
          </CardContent>

          <div className="p-4 bg-muted/20 border-t border-border flex justify-center">
            <Link
              href="/customer/vehicles"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full rounded-xl gap-1 text-xs justify-center")}
            >
              Manage My Vehicles
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Summary Charts: Requests by Status Donut & Monthly Spend Bar */}
      {(summaryData || initialSummary) && (
        <CustomerSummaryCharts summary={(summaryData || initialSummary)!} />
      )}

      {/* Recent Requests List Card */}
      <Card className="rounded-xl border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Requests
            </CardTitle>
            <CardDescription className="text-xs">
              {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} found
              {requestItems.length > 5 ? " (showing 5 per page)" : ""}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search requests..."
                value={requestSearch}
                onChange={(e) => {
                  setRequestSearch(e.target.value);
                  setRequestPage(1);
                }}
                className="pl-8 h-8 text-xs rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground shrink-0 hidden sm:inline">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val || "ALL");
                  setRequestPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-32 rounded-xl" aria-label="Filter requests by status" title="Filter requests by status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SEARCHING">Searching</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="EN_ROUTE">En Route</SelectItem>
                  <SelectItem value="ARRIVED">Arrived</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link
              href="/customer/requests"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 rounded-xl gap-1 text-xs")}
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedRequests.length > 0 ? (
            <div className="divide-y divide-border">
              {paginatedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground line-clamp-1">
                        {req.description}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {req.vehicle && (
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {req.vehicle.make} {req.vehicle.model} ({req.vehicle.plateNumber})
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/customer/requests/${req.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl text-xs gap-1 self-start sm:self-auto shrink-0")}
                  >
                    Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}

              {/* Client-side Pagination Footer */}
              <div className="p-4 sm:px-6 flex items-center justify-between bg-muted/10 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredRequests.length)} of{" "}
                  {filteredRequests.length} results
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="h-7 text-xs rounded-lg gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs font-semibold px-2 text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-7 text-xs rounded-lg gap-1"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : requestItems.length > 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No requests match your filter</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search query or status filter.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRequestSearch("");
                  setStatusFilter("ALL");
                  setRequestPage(1);
                }}
                className="text-xs text-primary"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <EmptyState
              title="No service requests yet"
              description="When you create roadside assistance requests, they will appear here."
              icon={<AlertCircle className="h-6 w-6 text-muted-foreground" />}
              action={
                <Link
                  href="/customer/requests/new"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl gap-2")}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create First Request
                </Link>
              }
              className="my-0 py-10 border-none bg-transparent"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
