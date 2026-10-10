"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Car,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Navigation,
  ShieldAlert,
  ArrowRight,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated, REQUEST_PRIORITIES } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";
import { getMyVehiclesApi } from "@/lib/api/endpoints/vehicles";
import { createServiceRequestApi } from "@/lib/api/endpoints/service-requests";
import {
  step1VehicleSchema,
  step2LocationSchema,
  step3ProblemSchema,
  Step1VehicleSchema,
  Step2LocationSchema,
  Step3ProblemSchema,
} from "@/lib/validations/service-requests";
import { useRequestWizardStore } from "@/stores/use-request-wizard-store";
import { compressImage, uploadImageWithProgress } from "@/lib/utils/image";
import { toastApiError } from "@/lib/errors";

import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface RequestWizardClientProps {
  initialVehicles: Paginated<Vehicle> | null;
}

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "idle" | "compressing" | "uploading" | "success" | "error";
  errorMessage?: string;
}

const STEPS = [
  { id: 1, title: "Vehicle", description: "Select vehicle" },
  { id: 2, title: "Location", description: "GPS & coordinates" },
  { id: 3, title: "Problem", description: "Issue description" },
  { id: 4, title: "Summary", description: "Photos & submit" },
];

const MAX_PHOTOS = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function RequestWizardClient({ initialVehicles }: RequestWizardClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Client hydration check for Zustand sessionStorage store
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const {
    currentStep,
    draft,
    setStep,
    nextStep,
    prevStep,
    updateDraft,
    clearDraft,
  } = useRequestWizardStore();

  // Prefetched vehicles query
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useQuery({
    queryKey: queryKeys.vehicles.all(),
    queryFn: () => getMyVehiclesApi(),
    initialData: initialVehicles ?? undefined,
  });

  const vehicles = vehiclesData?.items ?? [];

  // Geolocation state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Forms for each step
  const form1 = useForm<Step1VehicleSchema>({
    resolver: zodResolver(step1VehicleSchema),
    defaultValues: { vehicleId: draft.vehicleId || "" },
  });

  const form2 = useForm<Step2LocationSchema>({
    resolver: zodResolver(step2LocationSchema),
    defaultValues: {
      lat: draft.lat,
      lng: draft.lng,
    },
  });

  const form3 = useForm<Step3ProblemSchema>({
    resolver: zodResolver(step3ProblemSchema),
    defaultValues: {
      description: draft.description || "",
      priority: draft.priority || "NORMAL",
    },
  });

  // Sync form values when Zustand draft hydrates/updates
  useEffect(() => {
    if (isHydrated) {
      if (draft.vehicleId) form1.setValue("vehicleId", draft.vehicleId);
      if (draft.lat !== undefined) form2.setValue("lat", draft.lat);
      if (draft.lng !== undefined) form2.setValue("lng", draft.lng);
      if (draft.description) form3.setValue("description", draft.description);
      if (draft.priority) form3.setValue("priority", draft.priority);
    }
  }, [isHydrated, draft, form1, form2, form3]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
    };
  }, [photos]);

  // Handle Photo File Selection & Compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const availableSlots = MAX_PHOTOS - photos.length;
    if (availableSlots <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    const filesArray = Array.from(selectedFiles).slice(0, availableSlots);
    const validFiles: File[] = [];

    for (const file of filesArray) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not an allowed format. Only JPG, PNG, and WEBP allowed.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsCompressing(true);
    const newPhotoItems: PhotoItem[] = [];

    for (const file of validFiles) {
      try {
        const compressedFile = await compressImage(file, 1.0);
        const previewUrl = URL.createObjectURL(compressedFile);
        newPhotoItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file: compressedFile,
          previewUrl,
          progress: 0,
          status: "idle",
        });
      } catch {
        toast.error(`Failed to compress ${file.name}`);
      }
    }

    setPhotos((prev) => [...prev, ...newPhotoItems]);
    setIsCompressing(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Geolocation handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please enter coordinates manually.");
      toast.error("Geolocation not supported");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        form2.setValue("lat", lat, { shouldValidate: true });
        form2.setValue("lng", lng, { shouldValidate: true });
        updateDraft({ lat, lng });
        setGeoLoading(false);
        toast.success("Location acquired successfully!");
      },
      (error) => {
        setGeoLoading(false);
        let message = "Could not retrieve your location. Please enter coordinates manually.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission was denied. Please allow access or enter coordinates manually.";
        } else if (error.code === error.TIMEOUT) {
          message = "Geolocation request timed out. Please try again or enter coordinates manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable. Please enter coordinates manually.";
        }
        setGeoError(message);
        toast.error(message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Demo Location Shortcut (Dhaka: 23.8103, 90.4125)
  const handleUseDemoLocation = () => {
    const lat = 23.8103;
    const lng = 90.4125;
    form2.setValue("lat", lat, { shouldValidate: true });
    form2.setValue("lng", lng, { shouldValidate: true });
    updateDraft({ lat, lng });
    setGeoError(null);
    toast.success("Demo location set to Dhaka (23.8103, 90.4125)");
  };


  // Step Navigation Handlers
  const handleStep1Submit = (values: Step1VehicleSchema) => {
    updateDraft({ vehicleId: values.vehicleId });
    nextStep();
  };

  const handleStep2Submit = (values: Step2LocationSchema) => {
    updateDraft({ lat: values.lat, lng: values.lng });
    nextStep();
  };

  const handleStep3Submit = (values: Step3ProblemSchema) => {
    updateDraft({ description: values.description, priority: values.priority });
    nextStep();
  };

  // Final Submit Handler (Double-submit guarded & progress tracked)
  const handleSubmitRequest = async () => {
    if (isSubmittingRequest) return;

    if (!draft.description || draft.lat === undefined || draft.lng === undefined) {
      toast.error("Missing required details. Please complete all previous steps.");
      return;
    }

    setIsSubmittingRequest(true);

    let createdRequestId: string | null = null;

    try {
      // 1. Create Service Request
      const res = await createServiceRequestApi({
        description: draft.description,
        lat: draft.lat,
        lng: draft.lng,
        vehicleId: draft.vehicleId || undefined,
        priority: draft.priority || "NORMAL",
      });

      createdRequestId = res.serviceRequest.id;

      // Invalidate service requests queries
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all() });

      // Clear draft store now that service request is created
      clearDraft();
    } catch (err) {
      setIsSubmittingRequest(false);
      toastApiError(err, "Failed to create service request");
      return;
    }

    // 2. Upload photos if attached
    let failedPhotoCount = 0;

    if (photos.length > 0 && createdRequestId) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading", progress: 0 } : p))
        );

        try {
          await uploadImageWithProgress(createdRequestId, photo.file, (percent) => {
            setPhotos((prev) =>
              prev.map((p) => (p.id === photo.id ? { ...p, progress: percent } : p))
            );
          });

          setPhotos((prev) =>
            prev.map((p) => (p.id === photo.id ? { ...p, status: "success", progress: 100 } : p))
          );
        } catch (uploadErr) {
          failedPhotoCount++;
          const errMsg = uploadErr instanceof Error ? uploadErr.message : "Upload failed";
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id ? { ...p, status: "error", errorMessage: errMsg } : p
            )
          );
        }
      }
    }

    setIsSubmittingRequest(false);

    if (failedPhotoCount > 0) {
      toast.warning(
        `Service request created! ${failedPhotoCount} photo(s) failed to upload. You can retry from the request page.`
      );
      router.push(`/customer/requests/${createdRequestId}?uploadFailed=true`);
    } else {
      toast.success("Service request submitted successfully!");
      router.push(`/customer/requests/${createdRequestId}`);
    }
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Request Roadside Assistance"
          description="Follow the steps to submit a service request for a mechanic."
        />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const selectedVehicle = vehicles.find((v) => v.id === draft.vehicleId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Request Roadside Assistance"
        description="Provide your vehicle, location, and issue details to get connected with nearby mechanics."
      />

      {/* Step Indicator */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center space-y-2 cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => {
                  if (step.id < currentStep && !isSubmittingRequest) setStep(step.id);
                }}
              >
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl font-bold text-sm sm:text-base transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isCurrent
                      ? "bg-primary/20 text-primary border-2 border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div>
                  <p
                    className={`text-xs sm:text-sm font-semibold leading-none ${
                      isCurrent ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: VEHICLE SELECTION */}
      {currentStep === 1 && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 1: Select Your Vehicle</CardTitle>
                <CardDescription>
                  Choose the vehicle that requires roadside assistance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {isLoadingVehicles ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">No Registered Vehicles Found</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                    You haven&apos;t added any vehicles to your account yet. Please register a vehicle first or proceed without one.
                  </p>
                </div>
                <Link href="/customer/vehicles">
                  <Button type="button" className="rounded-xl gap-2 shadow-sm">
                    <Car className="h-4 w-4" />
                    Register a Vehicle First
                  </Button>
                </Link>
              </div>
            ) : (
              <form id="step1-form" onSubmit={form1.handleSubmit(handleStep1Submit)}>
                <Controller
                  control={form1.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">Choose Vehicle</Label>
                      {vehicles.map((v) => {
                        const isSelected = field.value === v.id;
                        return (
                          <div
                            key={v.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:bg-muted/40"
                            }`}
                            onClick={() => {
                              field.onChange(v.id);
                              updateDraft({ vehicleId: v.id });
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="vehicleSelect"
                                checked={isSelected}
                                onChange={() => {
                                  field.onChange(v.id);
                                  updateDraft({ vehicleId: v.id });
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary"
                              />
                              <div>
                                <p className="font-semibold text-foreground text-base">
                                  {v.make} {v.model}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                  Plate: {v.plateNumber}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 rounded-lg">
                              {v.plateNumber}
                            </Badge>
                          </div>
                        );
                      })}

                      <div
                        className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                          !field.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:bg-muted/40"
                        }`}
                        onClick={() => {
                          field.onChange("");
                          updateDraft({ vehicleId: "" });
                        }}
                      >
                        <input
                          type="radio"
                          name="vehicleSelect"
                          checked={!field.value}
                          onChange={() => {
                            field.onChange("");
                            updateDraft({ vehicleId: "" });
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <span className="font-medium text-sm text-muted-foreground">
                          Skip / No specific vehicle registered
                        </span>
                      </div>
                    </div>
                  )}
                />
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" disabled className="rounded-xl opacity-50">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              type="submit"
              form="step1-form"
              onClick={() => {
                if (vehicles.length === 0) nextStep();
              }}
              className="rounded-xl gap-2"
            >
              Continue to Location
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: LOCATION */}
      {currentStep === 2 && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 2: Service Location</CardTitle>
                <CardDescription>
                  Use your browser GPS or enter coordinates manually to help mechanics locate you.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {/* Geolocation Button */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Automatic GPS Location
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to capture your current latitude and longitude automatically.
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Demo mechanics are located in Dhaka.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="rounded-xl gap-2 font-medium"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {geoLoading ? "Acquiring Position..." : "Use Current Location"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseDemoLocation}
                    className="rounded-xl gap-2 font-medium border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <MapPin className="h-4 w-4" />
                    Use demo location (Dhaka)
                  </Button>
                </div>
              </div>

              {geoError && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{geoError}</span>
                </div>
              )}

              {draft.lat !== undefined && draft.lng !== undefined && !geoError && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mt-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-mono font-medium">
                    Location set: Lat {draft.lat}, Lng {draft.lng}
                  </span>
                </div>
              )}
            </div>

            {/* Manual Coordinate Form */}
            <form id="step2-form" onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form2.control} name="lat" label="Latitude" required description="Range: -90.0 to 90.0">
                  {(field) => (
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 37.774929"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                        field.onChange(val);
                        updateDraft({ lat: val });
                      }}
                      className="rounded-xl bg-card border-border shadow-sm font-mono"
                    />
                  )}
                </FormField>

                <FormField control={form2.control} name="lng" label="Longitude" required description="Range: -180.0 to 180.0">
                  {(field) => (
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. -122.419416"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                        field.onChange(val);
                        updateDraft({ lng: val });
                      }}
                      className="rounded-xl bg-card border-border shadow-sm font-mono"
                    />
                  )}
                </FormField>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" form="step2-form" className="rounded-xl gap-2">
              Continue to Problem Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: PROBLEM DETAILS */}
      {currentStep === 3 && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 3: Problem Details</CardTitle>
                <CardDescription>
                  Describe the breakdown or service issue so mechanics can prepare the necessary tools.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <form id="step3-form" onSubmit={form3.handleSubmit(handleStep3Submit)} className="space-y-6">
              <FormField
                control={form3.control}
                name="description"
                label="Problem Description"
                required
                description="Provide at least 10 characters describing what happened."
              >
                {(field) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="e.g. Engine started overheating and smoke was coming out from under the hood. Car is parked on the side of the highway."
                    onChange={(e) => {
                      field.onChange(e);
                      updateDraft({ description: e.target.value });
                    }}
                    className="rounded-xl bg-card border-border shadow-sm resize-none"
                  />
                )}
              </FormField>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Urgency Priority <span className="text-destructive ml-1">*</span>
                </Label>
                <Controller
                  control={form3.control}
                  name="priority"
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {REQUEST_PRIORITIES.map((p) => {
                        const isSelected = field.value === p;
                        const isEmergency = p === "EMERGENCY";

                        return (
                          <div
                            key={p}
                            className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? isEmergency
                                  ? "border-destructive bg-destructive/5 shadow-sm"
                                  : "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:bg-muted/40"
                            }`}
                            onClick={() => {
                              field.onChange(p);
                              updateDraft({ priority: p });
                            }}
                          >
                            <input
                              type="radio"
                              name="prioritySelect"
                              checked={isSelected}
                              onChange={() => {
                                field.onChange(p);
                                updateDraft({ priority: p });
                              }}
                              className="h-4 w-4 mt-1 text-primary focus:ring-primary"
                            />
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {p} Priority
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {p === "LOW" && "Routine check or minor issue"}
                                {p === "NORMAL" && "Standard roadside assistance"}
                                {p === "HIGH" && "Urgent repair needed on busy road"}
                                {p === "EMERGENCY" && "Immediate hazard / dangerous location"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" form="step3-form" className="rounded-xl gap-2">
              Review & Attach Photos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: REVIEW & PHOTO ATTACHMENTS & SUBMIT */}
      {currentStep === 4 && (
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 4: Review & Submit</CardTitle>
                <CardDescription>
                  Attach optional damage photos and submit your roadside assistance request.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vehicle Summary Card */}
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Car className="h-4 w-4 text-primary" />
                  Vehicle
                </div>
                {selectedVehicle ? (
                  <div>
                    <p className="font-bold text-foreground text-base">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Plate: {selectedVehicle.plateNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific vehicle selected</p>
                )}
              </div>

              {/* Location Summary Card */}
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location Coordinates
                </div>
                <div>
                  <p className="font-mono font-semibold text-foreground text-sm">
                    Lat: {draft.lat ?? "N/A"}
                  </p>
                  <p className="font-mono font-semibold text-foreground text-sm mt-0.5">
                    Lng: {draft.lng ?? "N/A"}
                  </p>
                </div>
              </div>

              {/* Priority Summary Card */}
              <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Priority Level
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={`font-semibold text-xs px-3 py-1 rounded-lg ${
                      draft.priority === "EMERGENCY"
                        ? "border-destructive text-destructive bg-destructive/10"
                        : draft.priority === "HIGH"
                        ? "border-amber-500 text-amber-600 bg-amber-500/10"
                        : "border-primary text-primary bg-primary/10"
                    }`}
                  >
                    {draft.priority || "NORMAL"} PRIORITY
                  </Badge>
                </div>
              </div>
            </div>

            {/* Problem Description Summary */}
            <div className="rounded-2xl border border-border p-4 space-y-2 bg-card">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Problem Description
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {draft.description || "No description provided."}
              </p>
            </div>

            {/* Damage Photos Section */}
            <div className="rounded-2xl border border-border p-5 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Damage Photos (Optional)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attach up to {MAX_PHOTOS} photos of vehicle damage or location (JPG, PNG, WEBP).
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {photos.length} / {MAX_PHOTOS}
                </Badge>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={photos.length >= MAX_PHOTOS || isSubmittingRequest || isCompressing}
              />

              {/* Photos List / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-square flex flex-col items-center justify-center"
                  >
                    <Image
                      src={photo.previewUrl}
                      alt="Damage photo preview"
                      unoptimized
                      fill
                      className="object-cover"
                    />

                    {/* Progress overlay during upload */}
                    {photo.status === "uploading" && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-2 text-center gap-1 z-10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-[10px] font-mono font-semibold text-foreground">
                          {photo.progress}%
                        </span>
                      </div>
                    )}

                    {/* Error overlay */}
                    {photo.status === "error" && (
                      <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center p-2 text-center text-destructive-foreground gap-1 z-10">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-[10px] font-semibold leading-tight">Failed</span>
                      </div>
                    )}

                    {/* Remove button */}
                    {!isSubmittingRequest && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 text-foreground flex items-center justify-center shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors z-20"
                        title="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Upload Button Tile */}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing || isSubmittingRequest}
                    className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl aspect-square flex flex-col items-center justify-center p-2 gap-1.5 transition-all text-muted-foreground hover:text-primary disabled:opacity-50"
                  >
                    {isCompressing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium text-center">
                      {isCompressing ? "Compressing..." : "Add Photo"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmittingRequest}
              className="rounded-xl gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmittingRequest || isCompressing}
              className="rounded-xl gap-2 font-medium shadow-sm"
            >
              {isSubmittingRequest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
