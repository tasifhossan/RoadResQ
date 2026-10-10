"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Car,
  MapPin,
  Calendar,
  AlertCircle,
  Upload,
  Loader2,
  ArrowLeft,
  ImageIcon,
  X,
  RefreshCw,
  Clock,
  User,
  Star,
  DollarSign,
  CreditCard,
  MessageSquare,
  Package,
  Search,
  Navigation,
  CheckCircle2,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { formatMoney } from "@/lib/format";
import { ServiceRequest, NearbyMechanicItem } from "@/lib/types/service-requests";
import {
  getServiceRequestByIdApi,
  getServiceRequestImagesApi,
  createReviewApi,
  assignMechanicApi,
  getNearbyMechanicsApi,
  cancelServiceRequestApi,
} from "@/lib/api/endpoints/service-requests";
import { initiatePaymentApi } from "@/lib/api/endpoints/payments";
import { cancelServiceRequestSchema } from "@/lib/validations/service-requests";
import { compressImage, uploadImageWithProgress } from "@/lib/utils/image";
import { toastApiError } from "@/lib/errors";

import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RequestDetailClientProps {
  initialRequest: ServiceRequest;
  requestId: string;
}

interface PhotoRetryItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
}

const RADIUS_OPTIONS = [
  { label: "5 km radius", value: "5" },
  { label: "10 km radius", value: "10" },
  { label: "15 km radius", value: "15" },
  { label: "25 km radius", value: "25" },
  { label: "50 km radius", value: "50" },
];

export function RequestDetailClient({
  initialRequest,
  requestId,
}: RequestDetailClientProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const showUploadFailedBanner = searchParams.get("uploadFailed") === "true";

  // State for Review Dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // State for "Find a Mechanic" Panel
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedMechanicForAssign, setSelectedMechanicForAssign] = useState<NearbyMechanicItem | null>(null);
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);

  // Detail Query with Live Status Polling
  const {
    data: requestData,
    refetch: refetchRequest,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.detail(requestId),
    queryFn: async () => {
      const res = await getServiceRequestByIdApi(requestId);
      return res.serviceRequest;
    },
    initialData: initialRequest,
    // Live status polling every 5s while status is non-terminal (not COMPLETED or CANCELLED)
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const isNonTerminal = status && status !== "COMPLETED" && status !== "CANCELLED";
      return isNonTerminal ? 5000 : false;
    },
  });

  const request = requestData ?? initialRequest;
  const canSearchAndAssign =
    (request.status === "PENDING" || request.status === "SEARCHING") &&
    !request.mechanicId;

  // Nearby Mechanics Query for "Find a Mechanic" panel
  const {
    data: nearbyData,
    isLoading: isLoadingNearby,
    refetch: refetchNearby,
  } = useQuery({
    queryKey: ["service-requests", "nearby", { lat: request.lat, lng: request.lng, radiusKm }],
    queryFn: () => getNearbyMechanicsApi(request.lat, request.lng, radiusKm),
    enabled: canSearchAndAssign,
  });

  const nearbyMechanics: NearbyMechanicItem[] = nearbyData?.mechanics ?? [];

  // Images Query
  const { data: imagesData, refetch: refetchImages } = useQuery({
    queryKey: ["service-requests", requestId, "images"],
    queryFn: async () => {
      const res = await getServiceRequestImagesApi(requestId);
      return res?.images ?? [];
    },
    initialData: request.images ?? undefined,
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (values: { rating: number; comment?: string }) =>
      createReviewApi(requestId, values),
    onSuccess: () => {
      toast.success("Review submitted successfully! Thank you for your feedback.");
      setReviewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
    },
    onError: (err) => {
      toastApiError(err, "Failed to submit review");
    },
  });

  // Assign Mechanic Mutation with Transaction Error Handling & List Refetch
  const assignMutation = useMutation({
    mutationFn: (mechanicId: string) => assignMechanicApi(requestId, mechanicId),
    onSuccess: () => {
      toast.success(
        selectedMechanicForAssign
          ? `Mechanic ${selectedMechanicForAssign.name} assigned successfully!`
          : "Mechanic assigned successfully!"
      );
      setConfirmAssignOpen(false);
      setSelectedMechanicForAssign(null);
      refetchRequest();
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all() });
    },
    onError: (err) => {
      // Clear toast for conflict/busy errors and refetch the list immediately
      toastApiError(err, "Could not assign mechanic. Please try another mechanic.");
      setConfirmAssignOpen(false);
      setSelectedMechanicForAssign(null);
      refetchNearby();
    },
  });

  // State for Cancel Request Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Cancel Request Mutation
  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => cancelServiceRequestApi(requestId, reason),
    onSuccess: () => {
      toast.success("Service request cancelled successfully.");
      setCancelDialogOpen(false);
      setCancelReason("");
      refetchRequest();
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to cancel service request.");
      setCancelDialogOpen(false);
      setCancelReason("");
      refetchRequest();
    },
  });

  // Initiate Payment Mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: (invoiceId: string) => initiatePaymentApi(invoiceId),
    onSuccess: (res) => {
      if (res?.paymentUrl) {
        window.location.assign(res.paymentUrl);
      } else {
        toast.error("Failed to retrieve payment gateway URL");
      }
    },
    onError: (err) => {
      toastApiError(err, "Failed to initiate payment");
    },
  });

  // Retry photos state & handlers
  const [retryPhotos, setRetryPhotos] = useState<PhotoRetryItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploadingRetry, setIsUploadingRetry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectRetryPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    setIsCompressing(true);

    const newItems: PhotoRetryItem[] = [];
    for (const file of filesArray) {
      try {
        const compressed = await compressImage(file, 1.0);
        const previewUrl = URL.createObjectURL(compressed);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: compressed,
          previewUrl,
          progress: 0,
          status: "idle",
        });
      } catch {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setRetryPhotos((prev) => [...prev, ...newItems]);
    setIsCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveRetryPhoto = (id: string) => {
    setRetryPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleUploadRetryPhotos = async () => {
    if (retryPhotos.length === 0 || isUploadingRetry) return;
    setIsUploadingRetry(true);

    let successCount = 0;
    for (const photo of retryPhotos) {
      if (photo.status === "success") continue;

      setRetryPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading", progress: 0 } : p))
      );

      try {
        await uploadImageWithProgress(requestId, photo.file, (percent) => {
          setRetryPhotos((prev) =>
            prev.map((p) => (p.id === photo.id ? { ...p, progress: percent } : p))
          );
        });

        setRetryPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: "success", progress: 100 } : p))
        );
        successCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setRetryPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: "error", errorMessage: message } : p))
        );
      }
    }

    setIsUploadingRetry(false);
    refetchImages();
    refetchRequest();

    if (successCount > 0) {
      toast.success(`${successCount} photo(s) uploaded successfully!`);
    }
  };

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

  const attachedImages = imagesData ?? request.images ?? [];
  const partsUsed = request.partsUsed ?? [];
  const invoice = request.invoice;
  const review = request.review;
  const statusHistory = request.statusHistory ?? [];
  const mechanic = request.mechanic;

  const isPending = request.status === "PENDING";
  const isCompleted = request.status === "COMPLETED";
  const isCancelled = request.status === "CANCELLED";
  const isCancellable =
    request.status === "PENDING" ||
    request.status === "SEARCHING" ||
    request.status === "ASSIGNED";

  const isPaid = invoice?.status === "PAID";
  const canPayInvoice = !!(invoice && !isPaid && !isCancelled);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button & Polling Indicator */}
      <div className="flex items-center justify-between">
        <Link href="/customer/requests">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to My Requests
          </Button>
        </Link>
      </div>

      {/* Upload Failed Warning Banner */}
      {showUploadFailedBanner && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Request Created with Missing Photos</p>
            <p>
              Your service request was created, but damage photos failed to upload during submission. You can attach damage photos below.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Request #{request.id.slice(-6).toUpperCase()}
            </h1>
            <StatusBadge status={request.status} />
            <StatusBadge status={request.priority} />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Created {formatDate(request.createdAt)}
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isCancellable && (
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="rounded-xl gap-2 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <X className="h-4 w-4" />
              Cancel Request
            </Button>
          )}

          {isCompleted && !review && (
            <Button
              onClick={() => setReviewDialogOpen(true)}
              className="rounded-xl gap-2 font-medium shadow-sm"
            >
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          )}

          {/* Pay Now Button */}
          {canPayInvoice && (
            <Button
              type="button"
              onClick={() => initiatePaymentMutation.mutate(invoice.id)}
              disabled={initiatePaymentMutation.isPending}
              className="rounded-xl gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {initiatePaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Pay Now ({formatMoney(invoice.totalAmount ?? invoice.totalCost ?? invoice.total)})
            </Button>
          )}
        </div>
      </div>

      {/* FIND A MECHANIC PANEL (Shown when request can search & assign mechanics) */}
      {canSearchAndAssign && (
        <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-primary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Find a Nearby Mechanic
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Search and assign available mechanics near Lat: {request.lat}, Lng: {request.lng}
                  </CardDescription>
                </div>
              </div>

              {/* Radius Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Search Radius:
                </Label>
                <Select
                  value={radiusKm.toString()}
                  onValueChange={(val) => setRadiusKm(Number(val))}
                >
                  <SelectTrigger className="w-[140px] rounded-xl bg-card border-border shadow-sm text-xs">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {RADIUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {isLoadingNearby ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : nearbyMechanics.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-border bg-card/60 space-y-2">
                <Navigation className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-foreground text-sm">No mechanics found within {radiusKm}km</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try expanding the search radius using the selector above to find available mechanics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {nearbyMechanics.map((m: NearbyMechanicItem) => {
                  const distanceKm = m.distanceKm ?? m.distance ?? 0;
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-foreground text-base">{m.name}</h4>
                            <StatusBadge status={m.availability || "AVAILABLE"} />
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              {(m.rating ?? 5.0).toFixed(1)} Rating
                            </span>
                            <span>•</span>
                            <span className="font-mono font-medium text-foreground">
                              {distanceKm.toFixed(1)} km away
                            </span>
                            <span>•</span>
                            <span>{m.totalJobs ?? 0} jobs completed</span>
                          </div>

                          {m.skills && m.skills.length > 0 && (
                            <div className="flex items-center gap-1 pt-1 flex-wrap">
                              {m.skills.slice(0, 3).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedMechanicForAssign(m);
                          setConfirmAssignOpen(true);
                        }}
                        className="rounded-xl gap-1.5 font-medium shrink-0 w-full sm:w-auto"
                      >
                        <User className="h-4 w-4" />
                        Assign Mechanic
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Transition History Timeline */}
      {statusHistory.length > 0 && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="relative pl-6 space-y-4 border-l-2 border-primary/20">
              {statusHistory.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-muted/20 p-3 rounded-xl border border-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={item.toStatus || "PENDING"} />
                      {item.fromStatus && (
                        <span className="text-xs text-muted-foreground">
                          (from {item.fromStatus})
                        </span>
                      )}
                      {item.actorRole && (
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          by {item.actorRole}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request.vehicle ? (
              <div>
                <p className="font-bold text-foreground text-base">
                  {request.vehicle.make} {request.vehicle.model}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Plate: {request.vehicle.plateNumber}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific vehicle registered</p>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono font-semibold text-foreground">
              Lat: {request.lat}
            </p>
            <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
              Lng: {request.lng}
            </p>
          </CardContent>
        </Card>

        {/* Assigned Mechanic */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Assigned Mechanic
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mechanic ? (
              <div className="space-y-1">
                <p className="font-bold text-foreground text-base">{mechanic.name}</p>
                {mechanic.mechanicProfile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {mechanic.mechanicProfile.rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <StatusBadge status={mechanic.mechanicProfile.availability} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground italic">No mechanic assigned yet</p>
                <p className="text-xs text-primary font-medium">Use the search panel above to select a mechanic.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problem Description Card */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Problem Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </CardContent>
      </Card>

      {/* Attached Damage Photos & Retry Section */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Damage Photos</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {attachedImages.length} Attached
            </Badge>
          </div>
          <CardDescription>
            Photos uploaded to assist mechanics with diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attachedImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No damage photos attached yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attachedImages.map((img) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted/40 block shadow-sm hover:opacity-95 transition-opacity"
                >
                  <Image
                    src={img.url}
                    alt={`Vehicle damage photo ${img.id}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Upload / Retry Control for PENDING requests */}
          {isPending && (
            <div className="pt-4 border-t border-border space-y-4">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Attach Additional / Retry Damage Photos
              </h4>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSelectRetryPhotos}
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isCompressing || isUploadingRetry}
              />

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing || isUploadingRetry}
                  className="rounded-xl gap-2"
                >
                  {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Select Photos to Upload
                </Button>

                {retryPhotos.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleUploadRetryPhotos}
                    disabled={isUploadingRetry}
                    className="rounded-xl gap-2 shadow-sm"
                  >
                    {isUploadingRetry ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Upload ({retryPhotos.length})
                  </Button>
                )}
              </div>

              {/* Retry Photos Preview Grid */}
              {retryPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {retryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative rounded-xl overflow-hidden border border-border bg-muted/40 aspect-square flex flex-col items-center justify-center"
                    >
                      <Image
                        src={photo.previewUrl}
                        alt={`Preview for ${photo.file.name}`}
                        unoptimized
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover"
                      />

                      {photo.status === "uploading" && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-2 z-10">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-[10px] font-mono font-semibold">{photo.progress}%</span>
                        </div>
                      )}

                      {photo.status === "error" && (
                        <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center p-2 text-destructive-foreground z-10 text-center">
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-[10px] font-semibold">Failed</span>
                        </div>
                      )}

                      {!isUploadingRetry && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRetryPhoto(photo.id)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 text-foreground flex items-center justify-center shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors z-20"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spare Parts Used */}
      {partsUsed.length > 0 && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Spare Parts Used</CardTitle>
            </div>
            <CardDescription>
              Parts replaced or installed during repair.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-3 text-left font-semibold">Part Name</th>
                    <th className="p-3 text-center font-semibold">Quantity</th>
                    <th className="p-3 text-right font-semibold">Price @ Use</th>
                    <th className="p-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {partsUsed.map((part) => (
                    <tr key={part.id} className="hover:bg-muted/20">
                      <td className="p-3 font-medium">
                        {part.sparePart?.name || "Spare Part"}
                      </td>
                      <td className="p-3 text-center font-mono">{part.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatMoney(part.priceAtUse)}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {formatMoney(part.quantity * part.priceAtUse)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Summary & Payment Status */}
      {invoice && (
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={invoice.status} />
                {invoice.payment && <StatusBadge status={invoice.payment.status} />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Labor Cost</span>
              <span className="font-mono font-medium">{formatMoney(invoice.laborCost)}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Parts Cost</span>
              <span className="font-mono font-medium">{formatMoney(invoice.partsCost)}</span>
            </div>

            <div className="flex items-center justify-between text-base font-bold pt-2">
              <span>Total Amount</span>
              <span className="font-mono text-primary text-lg">{formatMoney(invoice.totalAmount ?? invoice.totalCost ?? invoice.total)}</span>
            </div>
          </CardContent>

          {/* Invoice Paid State */}
          {isPaid && (
            <CardFooter className="bg-emerald-500/10 border-t border-emerald-500/20 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Invoice is fully paid. Thank you!</span>
              </div>
            </CardFooter>
          )}

          {/* Pay Now Footer Button */}
          {canPayInvoice && (
            <CardFooter className="bg-emerald-500/10 border-t border-emerald-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {invoice.payment?.status === "FAILED"
                    ? "Previous payment failed. Click to try again."
                    : "Invoice is pending payment."}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => initiatePaymentMutation.mutate(invoice.id)}
                disabled={initiatePaymentMutation.isPending}
                className="rounded-xl gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md w-full sm:w-auto"
              >
                {initiatePaymentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay Now ({formatMoney(invoice.totalAmount ?? invoice.totalCost ?? invoice.total)})
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Review Block */}
      {review && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Your Review</CardTitle>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{review.rating} / 5</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {review.comment ? (
              <p className="text-sm text-foreground italic bg-muted/30 p-3 rounded-xl border border-border">
                &quot;{review.comment}&quot;
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No comment left.</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">
              Reviewed on {formatDate(review.createdAt)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Write a Review</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Rate your experience with the service provided for this request.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              reviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
            }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rating (1 to 5 Stars)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment" className="text-sm font-medium">
                Comment (Optional)
              </Label>
              <Textarea
                id="review-comment"
                rows={3}
                placeholder="Describe how the mechanic performed..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={500}
                className="rounded-xl bg-card border-border shadow-sm resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                disabled={reviewMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reviewMutation.isPending}
                className="rounded-xl gap-2 font-medium"
              >
                {reviewMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Assign Mechanic Dialog */}
      <ConfirmDialog
        open={confirmAssignOpen}
        onOpenChange={setConfirmAssignOpen}
        title="Confirm Mechanic Assignment"
        description={`Are you sure you want to assign mechanic "${selectedMechanicForAssign?.name || ""}" to your service request?`}
        confirmText="Confirm Assignment"
        cancelText="Cancel"
        loading={assignMutation.isPending}
        onConfirm={() => {
          if (selectedMechanicForAssign) assignMutation.mutate(selectedMechanicForAssign.id);
        }}
      />

      {/* Confirm Cancel Service Request Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setCancelReason("");
        }}
        title="Cancel Service Request"
        description="Are you sure you want to cancel this service request? This action cannot be undone."
        confirmText="Cancel Request"
        cancelText="Keep Request"
        variant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          const res = cancelServiceRequestSchema.safeParse(cancelReason ? { reason: cancelReason } : {});
          if (!res.success) {
            toast.error(res.error.issues[0]?.message || "Invalid cancellation reason");
            return;
          }
          cancelMutation.mutate(res.data.reason);
        }}
      >
        <div className="space-y-2 pt-2">
          <Label htmlFor="cancel-reason" className="text-xs font-semibold text-foreground">
            Cancellation Reason (Optional)
          </Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            placeholder="e.g. Found alternative assistance..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={200}
            className="rounded-xl bg-card border-border shadow-sm resize-none text-xs"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground font-mono">
              {cancelReason.length} / 200
            </span>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
