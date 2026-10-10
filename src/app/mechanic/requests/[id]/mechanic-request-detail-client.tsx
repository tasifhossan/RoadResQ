"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Car,
  MapPin,
  Calendar,
  CheckCircle2,
  Navigation,
  Wrench,
  FileText,
  DollarSign,
  Package,
  XCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Phone,
  Plus,
  Loader2,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { formatMoney } from "@/lib/format";
import { RequestStatus, ServiceRequest } from "@/lib/types/service-requests";
import {
  getServiceRequestByIdApi,
  acceptAssignmentApi,
  updateServiceRequestStatusApi,
  cancelServiceRequestApi,
  addPartsUsedApi,
} from "@/lib/api/endpoints/service-requests";
import { getMechanicInventoryApi } from "@/lib/api/endpoints/mechanics";
import { updateStatusSchema, cancelServiceRequestSchema } from "@/lib/validations/service-requests";
import { toastApiError } from "@/lib/errors";

import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MechanicRequestDetailClientProps {
  initialRequest: ServiceRequest;
  requestId: string;
}

type ActionType = "ACCEPT" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null;

const STATUS_PIPELINE: RequestStatus[] = [
  "ASSIGNED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
];

const isTerminalStatus = (status?: string) =>
  status === "COMPLETED" || status === "CANCELLED";

export function MechanicRequestDetailClient({
  initialRequest,
  requestId,
}: MechanicRequestDetailClientProps) {
  const queryClient = useQueryClient();

  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [laborCostInput, setLaborCostInput] = useState<string>("50.00");
  const [laborCostError, setLaborCostError] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>("");
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(null);

  // Form state for logging spare parts used
  const [selectedSparePartId, setSelectedSparePartId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1");

  // TanStack Query with 5s polling for non-terminal statuses
  const {
    data: requestData,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.detail(requestId),
    queryFn: async () => {
      const res = await getServiceRequestByIdApi(requestId);
      return res.serviceRequest;
    },
    initialData: initialRequest,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      return isTerminalStatus(currentStatus) ? false : 5000;
    },
  });

  const request = requestData || initialRequest;
  const currentStatus = request.status;

  // Query mechanic's OWN inventory (enabled only when status is IN_PROGRESS)
  const { data: inventoryData, isLoading: isInventoryLoading } = useQuery({
    queryKey: queryKeys.mechanics.inventory(),
    queryFn: () => getMechanicInventoryApi({ page: 1, limit: 50 }),
    enabled: currentStatus === "IN_PROGRESS",
  });

  const inventoryItems = inventoryData?.items || [];
  const selectedInventoryItem = inventoryItems.find(
    (item) => item.sparePartId === selectedSparePartId
  );

  // Accept Assignment Mutation
  const acceptMutation = useMutation({
    mutationFn: () => acceptAssignmentApi(requestId),
    onSuccess: () => {
      toast.success("Request accepted! Status updated to EN_ROUTE.");
      setActiveAction(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to accept service request");
      refetch();
    },
  });

  // Status Transition Mutation (ARRIVED, IN_PROGRESS, COMPLETED)
  const updateStatusMutation = useMutation({
    mutationFn: ({ nextStatus, laborCost }: { nextStatus: string; laborCost?: number }) =>
      updateServiceRequestStatusApi(requestId, nextStatus, laborCost),
    onSuccess: (_, variables) => {
      toast.success(`Request status updated to ${variables.nextStatus.replace("_", " ")}`);
      setActiveAction(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to update request status");
      refetch();
    },
  });

  // Cancel Service Request Mutation
  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => cancelServiceRequestApi(requestId, reason),
    onSuccess: () => {
      toast.success("Service request cancelled");
      setActiveAction(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.assigned() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to cancel service request");
      refetch();
    },
  });

  // Log Parts Used Mutation
  const addPartsMutation = useMutation({
    mutationFn: ({ sparePartId, quantity }: { sparePartId: string; quantity: number }) =>
      addPartsUsedApi(requestId, [{ sparePartId, quantity }]),
    onSuccess: () => {
      toast.success("Spare part logged successfully");
      setSelectedSparePartId("");
      setSelectedQuantity("1");
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.mechanics.inventory() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to log spare part");
      refetch();
    },
  });

  const isPending =
    acceptMutation.isPending ||
    updateStatusMutation.isPending ||
    cancelMutation.isPending ||
    addPartsMutation.isPending;

  const handleConfirmAction = () => {
    if (!activeAction) return;

    if (activeAction === "ACCEPT") {
      acceptMutation.mutate();
    } else if (activeAction === "ARRIVED") {
      updateStatusMutation.mutate({ nextStatus: "ARRIVED" });
    } else if (activeAction === "IN_PROGRESS") {
      updateStatusMutation.mutate({ nextStatus: "IN_PROGRESS" });
    } else if (activeAction === "COMPLETED") {
      const parsedCost = parseFloat(laborCostInput);
      const validation = updateStatusSchema.safeParse({
        status: "COMPLETED",
        laborCost: isNaN(parsedCost) ? -1 : parsedCost,
      });

      if (!validation.success) {
        const errorMsg =
          validation.error.issues[0]?.message || "Please enter a valid non-negative labor cost.";
        setLaborCostError(errorMsg);
        return;
      }
      setLaborCostError(null);
      updateStatusMutation.mutate({
        nextStatus: "COMPLETED",
        laborCost: validation.data.laborCost,
      });
    } else if (activeAction === "CANCELLED") {
      const validation = cancelServiceRequestSchema.safeParse({
        reason: cancelReasonInput.trim() || undefined,
      });

      if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || "Invalid cancel reason.";
        setCancelReasonError(errorMsg);
        return;
      }
      setCancelReasonError(null);
      cancelMutation.mutate(validation.data.reason);
    }
  };

  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSparePartId) {
      toast.error("Please select a spare part from your inventory.");
      return;
    }

    const qty = parseInt(selectedQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast.error("Quantity must be an integer of at least 1.");
      return;
    }

    addPartsMutation.mutate({ sparePartId: selectedSparePartId, quantity: qty });
  };

  if (isError) {
    return (
      <div className="py-8 max-w-4xl mx-auto">
        <ErrorState
          title="Failed to load job details"
          description={
            error instanceof Error ? error.message : "Service request could not be retrieved."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isCancelled = currentStatus === "CANCELLED";
  const isCompleted = currentStatus === "COMPLETED";

  // Calculate Parts Subtotal
  const partsSubtotal = (request.partsUsed || []).reduce(
    (sum, item) => sum + item.quantity * Number(item.priceAtUse),
    0
  );

  // Timeline active step determination
  const currentStepIndex = STATUS_PIPELINE.indexOf(currentStatus as RequestStatus);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/mechanic/requests"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl gap-2 text-xs font-semibold")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assigned Jobs
        </Link>
      </div>

      {/* Header & Status Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Service Request Details
            </h1>
            <StatusBadge status={currentStatus} />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            ID: {request.id}
          </p>
        </div>

        {/* Legal Action Buttons for Current Status */}
        {!isCompleted && !isCancelled && (
          <div className="flex flex-wrap items-center gap-3">
            {currentStatus === "ASSIGNED" && (
              <Button
                variant="default"
                onClick={() => setActiveAction("ACCEPT")}
                className="rounded-xl gap-2 font-bold shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept Request
              </Button>
            )}

            {currentStatus === "EN_ROUTE" && (
              <>
                <Button
                  variant="default"
                  onClick={() => setActiveAction("ARRIVED")}
                  className="rounded-xl gap-2 font-bold shadow-sm"
                >
                  <Navigation className="h-4 w-4" />
                  Mark Arrived
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelReasonInput("");
                    setCancelReasonError(null);
                    setActiveAction("CANCELLED");
                  }}
                  className="rounded-xl gap-2 font-medium text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Request
                </Button>
              </>
            )}

            {currentStatus === "ARRIVED" && (
              <>
                <Button
                  variant="default"
                  onClick={() => setActiveAction("IN_PROGRESS")}
                  className="rounded-xl gap-2 font-bold shadow-sm"
                >
                  <Wrench className="h-4 w-4" />
                  Start Repair
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelReasonInput("");
                    setCancelReasonError(null);
                    setActiveAction("CANCELLED");
                  }}
                  className="rounded-xl gap-2 font-medium text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Request
                </Button>
              </>
            )}

            {currentStatus === "IN_PROGRESS" && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setLaborCostInput("50.00");
                    setLaborCostError(null);
                    setActiveAction("COMPLETED");
                  }}
                  className="rounded-xl gap-2 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelReasonInput("");
                    setCancelReasonError(null);
                    setActiveAction("CANCELLED");
                  }}
                  className="rounded-xl gap-2 font-medium text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Request
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-3.5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Job Progress Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isCancelled ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center gap-3 text-sm font-semibold">
              <XCircle className="h-5 w-5 shrink-0" />
              This service request was cancelled.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
              {STATUS_PIPELINE.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 flex-1">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors border-2 shrink-0",
                        isPassed
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="text-left sm:text-center">
                      <span
                        className={cn(
                          "text-xs font-semibold block capitalize",
                          isCurrent ? "text-primary font-bold" : isPassed ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer & Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Card */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {request.customer ? (
              <>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Name</span>
                  <span className="text-base font-bold text-foreground">{request.customer.name}</span>
                </div>
                {request.customer.phone && (
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Phone Number</span>
                    <a
                      href={`tel:${request.customer.phone}`}
                      className="text-sm font-semibold text-primary flex items-center gap-1.5 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {request.customer.phone}
                    </a>
                  </div>
                )}
                {request.customer.email && (
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Email</span>
                    <span className="text-xs font-medium text-muted-foreground">{request.customer.email}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No customer information available.</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Card */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {request.vehicle ? (
              <>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Make & Model</span>
                  <span className="text-base font-bold text-foreground">
                    {request.vehicle.make} {request.vehicle.model}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Plate Number</span>
                  <span className="text-sm font-mono font-bold uppercase bg-muted/50 px-2.5 py-1 rounded-md inline-block mt-0.5">
                    {request.vehicle.plateNumber}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No vehicle attached to this request.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problem Description & Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Issue Overview (2 cols) */}
        <Card className="md:col-span-2 rounded-2xl border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Problem Description & Priority
              </CardTitle>
              <StatusBadge status={request.priority} />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-base font-semibold text-foreground bg-muted/20 p-4 rounded-xl border leading-relaxed">
              {request.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Requested on {new Date(request.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location Card (1 col) */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">GPS Coordinates</span>
              <span className="text-base font-bold text-foreground">
                {request.lat.toFixed(6)}, {request.lng.toFixed(6)}
              </span>
            </div>
            <a
              href={`https://maps.google.com/?q=${request.lat},${request.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl gap-2 text-xs w-full justify-center font-semibold text-primary border-primary/30 hover:bg-primary/5"
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Damage Photos Gallery */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="bg-muted/30 border-b py-3.5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Damage Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {request.images && request.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {request.images.map((img, i) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden border bg-muted shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={img.url}
                    alt={`Damage photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No damage photos uploaded for this service request.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Parts Used Section & Log Form */}
      <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-3.5 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Spare Parts Used
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            Parts Subtotal: {formatMoney(partsSubtotal)}
          </span>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Add Part Form (Only displayed when status is IN_PROGRESS) */}
          {currentStatus === "IN_PROGRESS" ? (
            <form onSubmit={handleAddPartSubmit} className="p-4 rounded-xl bg-muted/20 border space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Log Spare Part from Your Inventory
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6 space-y-1.5">
                  <Label htmlFor="inventorySelect" className="text-xs font-medium text-muted-foreground">
                    Select Part from My Inventory
                  </Label>
                  <Select
                    value={selectedSparePartId}
                    onValueChange={(val) => setSelectedSparePartId(val || "")}
                    disabled={isInventoryLoading || addPartsMutation.isPending}
                  >
                    <SelectTrigger id="inventorySelect" className="rounded-xl h-9 text-xs bg-card">
                      <SelectValue placeholder={isInventoryLoading ? "Loading inventory..." : "Choose spare part..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.sparePartId} value={item.sparePartId} className="text-xs">
                          {item.sparePart.name} - {formatMoney(item.price)} ({item.stock} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="partQty" className="text-xs font-medium text-muted-foreground">
                    Quantity
                  </Label>
                  <Input
                    id="partQty"
                    type="number"
                    min="1"
                    max={selectedInventoryItem?.stock || 50}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    disabled={addPartsMutation.isPending}
                    className="rounded-xl h-9 text-xs bg-card"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={!selectedSparePartId || addPartsMutation.isPending}
                    className="rounded-xl text-xs gap-1.5 font-bold w-full h-9"
                  >
                    {addPartsMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Log Part Used
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {selectedInventoryItem && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span>Price at use: <strong className="text-foreground">{formatMoney(selectedInventoryItem.price)}</strong></span>
                  <span>Available stock: <strong className={cn(selectedInventoryItem.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{selectedInventoryItem.stock} items</strong></span>
                </div>
              )}
            </form>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Spare parts can only be logged when the repair status is <strong>IN_PROGRESS</strong>.
            </p>
          )}

          {/* Logged Parts List */}
          {request.partsUsed && request.partsUsed.length > 0 ? (
            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              <div className="bg-muted/40 p-3 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Spare Part Name</span>
                <span>Qty x Unit Price</span>
                <span>Line Total</span>
              </div>
              {request.partsUsed.map((part) => {
                const unitPrice = Number(part.priceAtUse);
                const lineTotal = part.quantity * unitPrice;
                return (
                  <div key={part.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">
                        {part.sparePart?.name || `Part #${part.sparePartId.slice(-6)}`}
                      </p>
                    </div>
                    <div className="text-muted-foreground">
                      {part.quantity} × {formatMoney(unitPrice)}
                    </div>
                    <p className="font-bold text-foreground">
                      {formatMoney(lineTotal)}
                    </p>
                  </div>
                );
              })}

              <div className="p-4 bg-muted/20 flex justify-between items-center text-xs font-bold">
                <span>Parts Subtotal</span>
                <span className="text-sm font-extrabold text-primary">{formatMoney(partsSubtotal)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No spare parts logged for this job yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoice & Payment Summary (Shown if Invoice Exists or Job Completed) */}
      {request.invoice && (
        <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-3.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Auto-Generated Invoice & Payment Summary
            </CardTitle>
            <StatusBadge status={request.invoice.status} />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-muted/20 p-4 rounded-xl border">
              <div>
                <span className="text-muted-foreground block font-medium">Labor Cost</span>
                <span className="text-sm font-bold text-foreground">
                  {formatMoney(request.invoice.laborCost)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Parts Cost</span>
                <span className="text-sm font-bold text-foreground">
                  {formatMoney(request.invoice.partsCost)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Grand Total Amount</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(request.invoice.totalCost ?? request.invoice.laborCost)}
                </span>
              </div>
            </div>

            {request.invoice.payment && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Payment {request.invoice.payment.status} via {request.invoice.payment.gateway}
                </p>
                <p className="text-muted-foreground">
                  Amount: {formatMoney(request.invoice.payment.amount)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Confirmation Dialogs */}
      <ConfirmDialog
        open={activeAction === "ACCEPT"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title="Accept Service Request"
        description="Are you sure you want to accept this assignment? Your availability status will automatically set to BUSY and status will change to EN_ROUTE."
        confirmText="Accept & Start En Route"
        loading={isPending}
        onConfirm={handleConfirmAction}
      />

      <ConfirmDialog
        open={activeAction === "ARRIVED"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title="Mark as Arrived"
        description="Confirm that you have arrived at the customer's service location."
        confirmText="Confirm Arrival"
        loading={isPending}
        onConfirm={handleConfirmAction}
      />

      <ConfirmDialog
        open={activeAction === "IN_PROGRESS"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title="Start Repair Work"
        description="Transition request status to IN_PROGRESS. You will be able to log spare parts used."
        confirmText="Start Repair"
        loading={isPending}
        onConfirm={handleConfirmAction}
      />

      {/* Completion Dialog with Labor Cost Field */}
      <ConfirmDialog
        open={activeAction === "COMPLETED"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title="Complete Job & Generate Invoice"
        description="Mark job as completed. Enter the final labor cost to auto-generate the customer invoice."
        confirmText="Complete & Generate Invoice"
        loading={isPending}
        onConfirm={handleConfirmAction}
      >
        <div className="space-y-2 pt-2">
          <Label htmlFor="laborCostModal" className="text-xs font-semibold">
            Labor Cost (BDT) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="laborCostModal"
            type="number"
            step="0.01"
            min="0"
            placeholder="50.00"
            value={laborCostInput}
            onChange={(e) => setLaborCostInput(e.target.value)}
            className="rounded-xl"
          />
          {laborCostError && (
            <p className="text-xs text-destructive font-medium">{laborCostError}</p>
          )}
        </div>
      </ConfirmDialog>

      {/* Cancel Dialog with Reason Field */}
      <ConfirmDialog
        open={activeAction === "CANCELLED"}
        onOpenChange={(open) => !open && setActiveAction(null)}
        title="Cancel Service Request"
        description="Are you sure you want to cancel this service request? Your status will automatically reset to AVAILABLE."
        confirmText="Confirm Cancellation"
        variant="destructive"
        loading={isPending}
        onConfirm={handleConfirmAction}
      >
        <div className="space-y-2 pt-2">
          <Label htmlFor="cancelReasonModal" className="text-xs font-semibold">
            Cancel Reason (Optional)
          </Label>
          <Input
            id="cancelReasonModal"
            type="text"
            maxLength={200}
            placeholder="e.g. Unable to reach customer location"
            value={cancelReasonInput}
            onChange={(e) => setCancelReasonInput(e.target.value)}
            className="rounded-xl"
          />
          {cancelReasonError && (
            <p className="text-xs text-destructive font-medium">{cancelReasonError}</p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
