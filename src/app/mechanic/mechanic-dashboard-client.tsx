"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star,
  Wrench,
  Inbox,
  DollarSign,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
  Car,
  User,
  Calendar,
  AlertCircle,
  Activity,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import { ServiceRequest } from "@/lib/types/service-requests";
import { Availability, EarningsSummary } from "@/lib/types/mechanics";
import { getMeApi } from "@/lib/api/endpoints/users";
import {
  getAssignedServiceRequestsApi,
  acceptAssignmentApi,
} from "@/lib/api/endpoints/service-requests";
import {
  updateAvailabilityApi,
  updateLocationApi,
  getEarningsSummaryApi,
} from "@/lib/api/endpoints/mechanics";
import { toastApiError } from "@/lib/errors";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MechanicDashboardClientProps {
  initialUser: UserProfile | null;
  initialAssignedRequests: Paginated<ServiceRequest> | null;
  initialEarnings: EarningsSummary | null;
}

export function MechanicDashboardClient({
  initialUser,
  initialAssignedRequests,
  initialEarnings,
}: MechanicDashboardClientProps) {
  const queryClient = useQueryClient();
  const [isLocating, setIsLocating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // 1. User Profile query (auth.me)
  const { data: userData } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => getMeApi(),
    initialData: initialUser ? { user: initialUser } : undefined,
  });

  const currentUser = userData?.user || initialUser;
  const mechanicProfile = currentUser?.mechanicProfile;
  const currentAvailability: Availability =
    (mechanicProfile?.availability as Availability) || "OFFLINE";

  // 2. Assigned Requests query
  const {
    data: assignedData,
    isLoading: isAssignedLoading,
    isError: isAssignedError,
    refetch: refetchAssigned,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.assigned({ page: 1, limit: 10 }),
    queryFn: () => getAssignedServiceRequestsApi({ page: 1, limit: 10 }),
    initialData: initialAssignedRequests ?? undefined,
  });

  // 3. Earnings Summary query
  const { data: earningsData } = useQuery({
    queryKey: queryKeys.mechanics.earnings(),
    queryFn: () => getEarningsSummaryApi(),
    initialData: initialEarnings ?? undefined,
  });

  // Optimistic Availability Update Mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (newAvailability: Availability) =>
      updateAvailabilityApi({ availability: newAvailability }),
    onMutate: async (newAvailability) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.me() });

      const previousUserData = queryClient.getQueryData<{ user: UserProfile }>(
        queryKeys.auth.me()
      );

      if (previousUserData) {
        queryClient.setQueryData<{ user: UserProfile }>(queryKeys.auth.me(), {
          ...previousUserData,
          user: {
            ...previousUserData.user,
            mechanicProfile: previousUserData.user.mechanicProfile
              ? {
                  ...previousUserData.user.mechanicProfile,
                  availability: newAvailability,
                }
              : null,
          },
        });
      }

      return { previousUserData };
    },
    onError: (err, _newAvailability, context) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(queryKeys.auth.me(), context.previousUserData);
      }
      toastApiError(err, "Failed to update availability");
    },
    onSuccess: () => {
      toast.success("Availability updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
    },
  });

  // Location Update Mutation
  const updateLocationMutation = useMutation({
    mutationFn: (coords: { lat: number; lng: number }) => updateLocationApi(coords),
    onSuccess: () => {
      toast.success("Location updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to update location");
    },
  });

  // Accept Assignment Mutation
  const acceptAssignmentMutation = useMutation({
    mutationFn: (requestId: string) => acceptAssignmentApi(requestId),
    onMutate: (requestId) => {
      setAcceptingId(requestId);
    },
    onSuccess: () => {
      toast.success("Service request accepted!");
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to accept service request");
    },
    onSettled: () => {
      setAcceptingId(null);
    },
  });

  // Geolocation Handler
  const handleShareLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocationMutation.mutate(
          { lat: latitude, lng: longitude },
          {
            onSettled: () => {
              setIsLocating(false);
            },
          }
        );
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission was denied. Please allow location access in your browser.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Unable to retrieve your location position. Please try again.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("An error occurred while getting your location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const assignedItems = assignedData?.items || initialAssignedRequests?.items || [];

  // Categorize assigned items into "Needs response" and "Active job"
  const pendingInvitations = assignedItems.filter((req) => req.status === "ASSIGNED");

  const activeJob = assignedItems.find((req) =>
    ["EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(req.status)
  );

  const mechanicName = currentUser?.name || "Mechanic";
  const currentLat = mechanicProfile?.currentLat;
  const currentLng = mechanicProfile?.currentLng;
  const ratingVal = mechanicProfile?.rating ?? 0;
  const totalJobsVal = mechanicProfile?.totalJobs ?? 0;

  const grandTotal = earningsData?.totals?.grandTotal || "0.00";
  const pendingEarnings = earningsData?.pendingAmount || "0.00";

  if (isAssignedError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Error loading dashboard"
          description="Failed to retrieve assigned service requests. Please check your connection and try again."
          onRetry={() => refetchAssigned()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2 border-b">
        <PageHeader
          title={`Welcome back, ${mechanicName}`}
          description="Manage your availability status, live location updates, and assigned roadside assistance jobs."
        />

        {/* Availability Controls */}
        <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status:
            </span>
          </div>

          <StatusBadge status={currentAvailability} />

          <Select
            value={currentAvailability}
            onValueChange={(val) => updateAvailabilityMutation.mutate(val as Availability)}
            disabled={updateAvailabilityMutation.isPending}
          >
            <SelectTrigger className="w-[140px] rounded-xl h-9 text-xs font-medium">
              {updateAvailabilityMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <SelectValue placeholder="Set status" />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="AVAILABLE" className="text-xs font-medium">
                Available
              </SelectItem>
              <SelectItem value="BUSY" className="text-xs font-medium">
                Busy
              </SelectItem>
              <SelectItem value="OFFLINE" className="text-xs font-medium">
                Offline
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid: Stat Cards & Saved Location Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating */}
        <StatCard
          title="Rating"
          value={`${ratingVal.toFixed(1)} ★`}
          description="Average customer rating"
          icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
        />

        {/* Total Jobs */}
        <StatCard
          title="Completed Jobs"
          value={totalJobsVal}
          description="Total repairs completed"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />

        {/* Pending Requests / Invitations */}
        <StatCard
          title="Needs Response"
          value={pendingInvitations.length}
          description="Requests awaiting accept"
          icon={<Inbox className="h-5 w-5 text-indigo-500" />}
        />

        {/* Earnings Headline */}
        <StatCard
          title="Earnings Headline"
          value={`$${grandTotal}`}
          description={`Pending: $${pendingEarnings}`}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Location Card */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Saved Location Coordinates</CardTitle>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleShareLocation}
              disabled={isLocating || updateLocationMutation.isPending}
              className="rounded-xl gap-2 font-medium"
            >
              {isLocating || updateLocationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Share my location
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Coordinates
              </p>
              {currentLat !== null && currentLat !== undefined && currentLng !== null && currentLng !== undefined ? (
                <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <span>
                    {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Location coordinates not set. Click &quot;Share my location&quot; to update.
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground max-w-sm">
              Sharing your location allows nearby stranded drivers to discover your service area when searching for assistance.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Job Section */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Active Repair Job</CardTitle>
            </div>
            {activeJob && <StatusBadge status={activeJob.status} />}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {activeJob ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {activeJob.description}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Requested on {new Date(activeJob.createdAt).toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/mechanic/requests/${activeJob.id}`}
                  className={cn(buttonVariants({ variant: "default" }), "rounded-xl gap-2 font-medium shrink-0")}
                >
                  Manage Active Job
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {activeJob.customer && (
                  <div className="p-3.5 rounded-xl bg-muted/40 flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <span className="text-xs text-muted-foreground block font-medium">Customer</span>
                      <span className="font-semibold block truncate">{activeJob.customer.name}</span>
                      {activeJob.customer.phone && (
                        <span className="text-xs text-muted-foreground block">{activeJob.customer.phone}</span>
                      )}
                    </div>
                  </div>
                )}

                {activeJob.vehicle && (
                  <div className="p-3.5 rounded-xl bg-muted/40 flex items-center gap-3">
                    <Car className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <span className="text-xs text-muted-foreground block font-medium">Vehicle</span>
                      <span className="font-semibold block truncate">
                        {activeJob.vehicle.make} {activeJob.vehicle.model}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {activeJob.vehicle.plateNumber}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-muted/40 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="truncate">
                    <span className="text-xs text-muted-foreground block font-medium">Location</span>
                    <span className="font-semibold block truncate">
                      {activeJob.lat.toFixed(4)}, {activeJob.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active repair job"
              description="You currently have no active service request in progress."
              icon={<Wrench className="h-6 w-6 text-muted-foreground" />}
              className="my-0 py-6 border-none bg-transparent"
            />
          )}
        </CardContent>
      </Card>

      {/* Needs Your Response Section (ASSIGNED status) */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Needs Your Response ({pendingInvitations.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Service requests assigned to you by customers awaiting your acceptance.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isAssignedLoading ? (
            <div className="p-6 space-y-4">
              <div className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            </div>
          ) : pendingInvitations.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingInvitations.map((req) => (
                <div
                  key={req.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-foreground line-clamp-1">
                        {req.description}
                      </h4>
                      <StatusBadge status={req.priority} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {req.customer && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {req.customer.name} {req.customer.phone ? `(${req.customer.phone})` : ""}
                        </span>
                      )}

                      {req.vehicle && (
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {req.vehicle.make} {req.vehicle.model} ({req.vehicle.plateNumber})
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {req.lat.toFixed(4)}, {req.lng.toFixed(4)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    <Link
                      href={`/mechanic/requests/${req.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl text-xs gap-1")}
                    >
                      View Job
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => acceptAssignmentMutation.mutate(req.id)}
                      disabled={acceptingId === req.id || acceptAssignmentMutation.isPending}
                      className="rounded-xl text-xs gap-1 font-semibold"
                    >
                      {acceptingId === req.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Accept Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending invitations"
              description="You have no service requests awaiting response."
              icon={<AlertCircle className="h-6 w-6 text-muted-foreground" />}
              className="my-0 py-10 border-none bg-transparent"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
