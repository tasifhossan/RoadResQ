"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  ShieldAlert,
  X,
  RefreshCw,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { ServiceRequest } from "@/lib/types/service-requests";
import {
  getServiceRequestByIdApi,
  getServiceRequestImagesApi,
} from "@/lib/api/endpoints/service-requests";
import { compressImage, uploadImageWithProgress } from "@/lib/utils/image";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestDetailClientProps {
  initialRequest: ServiceRequest | null;
  initialError: string | null;
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

export function RequestDetailClient({
  initialRequest,
  initialError,
  requestId,
}: RequestDetailClientProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const showUploadFailedBanner = searchParams.get("uploadFailed") === "true";

  // Fetch detail query
  const {
    data: requestData,
    isLoading: isLoadingRequest,
    isError: isErrorRequest,
    error: errorRequest,
    refetch: refetchRequest,
  } = useQuery({
    queryKey: queryKeys.serviceRequests.detail(requestId),
    queryFn: async () => {
      const res = await getServiceRequestByIdApi(requestId);
      return res.serviceRequest;
    },
    initialData: initialRequest ?? undefined,
  });

  // Fetch images query
  const {
    data: imagesData,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useQuery({
    queryKey: ["service-requests", requestId, "images"],
    queryFn: async () => {
      const res = await getServiceRequestImagesApi(requestId);
      return res.images;
    },
  });

  // Retry photos state
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

    if (successCount > 0) {
      toast.success(`${successCount} photo(s) uploaded successfully!`);
    }
  };

  if (isLoadingRequest) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isErrorRequest || initialError || !requestData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/customer/requests">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
        <ErrorState
          title="Service Request Not Found"
          description={
            errorRequest instanceof Error
              ? errorRequest.message
              : initialError || "Could not load the requested service request."
          }
          onRetry={() => refetchRequest()}
        />
      </div>
    );
  }

  const request = requestData;
  const attachedImages = imagesData ?? [];
  const isPending = request.status === "PENDING";

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/customer/requests">
        <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to My Requests
        </Button>
      </Link>

      {/* Upload Failed Warning Banner */}
      {showUploadFailedBanner && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Request Created with Missing Photos</p>
            <p>
              Your service request was successfully created, but one or more damage photos failed to upload during submission. You can attach damage photos below.
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
      </div>

      {/* Details Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicle */}
        <Card className="rounded-2xl border-border">
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
        <Card className="rounded-2xl border-border">
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

        {/* Costs / Priority */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Urgency Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={request.priority} />
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      <Card className="rounded-2xl border-border">
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

      {/* Attached Damage Photos */}
      <Card className="rounded-2xl border-border">
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
          {isLoadingImages ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : attachedImages.length === 0 ? (
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
                    alt="Damage photo"
                    fill
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Upload Retry Form for PENDING status */}
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
                        alt="Retry preview"
                        unoptimized
                        fill
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
    </div>
  );
}
