"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Car,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { ServiceRequest } from "@/lib/types/service-requests";
import {
  getServiceRequestByIdApi,
  acceptAssignmentApi,
  updateServiceRequestStatusApi,
} from "@/lib/api/endpoints/service-requests";
import { toastApiError } from "@/lib/errors";

import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MechanicRequestDetailClientProps {
  initialRequest: ServiceRequest;
  requestId: string;
}

export function MechanicRequestDetailClient({
  initialRequest,
  requestId,
}: MechanicRequestDetailClientProps) {
  const queryClient = useQueryClient();
  const [laborCostInput, setLaborCostInput] = useState<string>("50.00");

  const {
    data: requestData,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.detail(requestId),
    queryFn: async () => {
      const res = await getServiceRequestByIdApi(requestId);
      return res.serviceRequest;
    },
    initialData: initialRequest,
  });

  const request = requestData || initialRequest;

  // Accept Assignment Mutation
  const acceptMutation = useMutation({
    mutationFn: () => acceptAssignmentApi(requestId),
    onSuccess: () => {
      toast.success("Request accepted! Status changed to EN_ROUTE.");
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to accept request");
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ nextStatus, laborCost }: { nextStatus: string; laborCost?: number }) =>
      updateServiceRequestStatusApi(requestId, nextStatus, laborCost),
    onSuccess: (_, variables) => {
      toast.success(`Status updated to ${variables.nextStatus}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to update request status");
    },
  });

  if (isError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Request Not Found"
          description="Could not fetch service request details."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const getNextStatus = (currentStatus: string): { label: string; status: string; requiresLabor?: boolean } | null => {
    switch (currentStatus) {
      case "ASSIGNED":
        return { label: "Accept Request", status: "ACCEPT" };
      case "EN_ROUTE":
        return { label: "Mark Arrived", status: "ARRIVED" };
      case "ARRIVED":
        return { label: "Start Repair", status: "IN_PROGRESS" };
      case "IN_PROGRESS":
        return { label: "Complete Job", status: "COMPLETED", requiresLabor: true };
      default:
        return null;
    }
  };

  const nextAction = getNextStatus(request.status);

  const handleActionClick = () => {
    if (!nextAction) return;

    if (nextAction.status === "ACCEPT") {
      acceptMutation.mutate();
    } else {
      const laborCostNum = nextAction.requiresLabor ? parseFloat(laborCostInput) || 0 : undefined;
      updateStatusMutation.mutate({ nextStatus: nextAction.status, laborCost: laborCostNum });
    }
  };

  const isPendingAction = acceptMutation.isPending || updateStatusMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/mechanic"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl gap-2 text-xs")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Job Request Details</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Request ID: <span className="font-mono">{request.id}</span>
          </p>
        </div>

        {/* Action Button */}
        {nextAction && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {nextAction.requiresLabor && (
              <div className="flex items-center gap-2">
                <Label htmlFor="laborCost" className="text-xs font-semibold shrink-0">
                  Labor Cost ($):
                </Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={laborCostInput}
                  onChange={(e) => setLaborCostInput(e.target.value)}
                  className="w-24 h-9 text-xs rounded-xl"
                />
              </div>
            )}

            <Button
              variant="default"
              onClick={handleActionClick}
              disabled={isPendingAction}
              className="rounded-xl gap-2 font-semibold shadow-sm"
            >
              {isPendingAction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {nextAction.label}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Issue Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Description
            </span>
            <p className="text-base font-semibold text-foreground bg-muted/20 p-4 rounded-xl border">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {request.customer && (
              <div className="p-4 rounded-xl bg-muted/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Customer Information
                </span>
                <p className="font-bold text-foreground">{request.customer.name}</p>
                {request.customer.phone && (
                  <p className="text-xs text-muted-foreground">{request.customer.phone}</p>
                )}
                {request.customer.email && (
                  <p className="text-xs text-muted-foreground">{request.customer.email}</p>
                )}
              </div>
            )}

            {request.vehicle && (
              <div className="p-4 rounded-xl bg-muted/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Vehicle Details
                </span>
                <p className="font-bold text-foreground">
                  {request.vehicle.make} {request.vehicle.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  Plate: <span className="font-mono uppercase">{request.vehicle.plateNumber}</span>
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-muted/30 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Service Location
              </span>
              <p className="font-bold text-foreground">
                {request.lat.toFixed(6)}, {request.lng.toFixed(6)}
              </p>
              <a
                href={`https://maps.google.com/?q=${request.lat},${request.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline font-medium inline-block mt-1"
              >
                Open in Google Maps
              </a>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Timestamps & Priority
              </span>
              <p className="text-xs text-muted-foreground">
                Priority: <StatusBadge status={request.priority} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Created: {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
