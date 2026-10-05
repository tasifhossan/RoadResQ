"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  Star,
  User as UserIcon,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { UrlPagination } from "@/components/shared/url-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { queryKeys } from "@/lib/api/keys";
import { Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import { toastApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { GetMechanicReviewsQueryInput, Review } from "@/lib/types/reviews";
import { getMeApi, updateMeApi } from "@/lib/api/endpoints/users";
import { getMechanicReviewsApi } from "@/lib/api/endpoints/reviews";

interface MechanicProfileClientProps {
  initialUser: UserProfile | null;
  initialReviews: Paginated<Review> | null;
  initialError: string | null;
  reviewsQueryParams: GetMechanicReviewsQueryInput;
}

export function MechanicProfileClient({
  initialUser,
  initialReviews,
  initialError,
  reviewsQueryParams,
}: MechanicProfileClientProps) {
  const queryClient = useQueryClient();

  // User Profile Query
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await getMeApi();
      return res.user;
    },
    initialData: initialUser ?? undefined,
  });

  const user = userData ?? initialUser;
  const mechanicProfile = user?.mechanicProfile;

  // Form State prefilled from user
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Sync state if user data loads after initial mount
  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }

  // Mechanic Reviews Query
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: queryKeys.mechanics.reviews(user?.id ?? "", reviewsQueryParams),
    queryFn: () => getMechanicReviewsApi(user!.id, reviewsQueryParams),
    enabled: Boolean(user?.id),
    initialData: initialReviews ?? undefined,
  });

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: updateMeApi,
    onSuccess: (res) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(queryKeys.auth.me(), res.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (err) => {
      toastApiError(err);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    updateMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
    });
  };

  const reviews = reviewsData?.items ?? [];
  const reviewsMeta = reviewsData?.meta;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Mechanic Profile"
        description="Manage your account information, view your professional skills, and customer job reviews."
      />

      {/* Error state */}
      {(isUserError || initialError) && !user && (
        <ErrorState
          title="Failed to load profile"
          description={initialError || (userError ? (userError as Error).message : "An error occurred")}
          onRetry={() => {
            void refetchUser();
          }}
        />
      )}

      {/* Loading state */}
      {isUserLoading && !user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      )}

      {user && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Details Form (Editable Name & Phone) */}
            <Card className="lg:col-span-2 rounded-2xl border-border bg-card shadow-sm p-6 space-y-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  Update your personal name and contact phone number. Email and role are fixed.
                </CardDescription>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="user-name" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="user-name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        placeholder="Your full name"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="user-phone" className="text-xs font-semibold">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="user-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1700000000"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="user-email" className="text-xs font-semibold text-muted-foreground">
                      Email Address (Read-only)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="user-email"
                        value={user.email}
                        disabled
                        className="pl-9 rounded-xl bg-muted/40 text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Role (Read-only) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Account Role
                    </Label>
                    <div className="h-10 px-3 flex items-center rounded-xl bg-muted/40 border border-border">
                      <Badge variant="secondary" className="rounded-md text-xs font-semibold gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-xl gap-2 font-medium shadow-sm"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>

            {/* Read-Only Mechanic Profile Metrics */}
            <Card className="rounded-2xl border-border bg-card shadow-sm p-6 space-y-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Professional Profile
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  Read-only mechanic credentials and ratings.
                </CardDescription>
              </div>

              {mechanicProfile ? (
                <div className="space-y-4 pt-2 text-sm">
                  {/* Availability */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Availability Status
                    </span>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        mechanicProfile.availability === "AVAILABLE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : mechanicProfile.availability === "BUSY"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {mechanicProfile.availability}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> Overall Rating
                    </span>
                    <span className="font-bold text-foreground">
                      {mechanicProfile.rating.toFixed(1)} / 5.0
                    </span>
                  </div>

                  {/* Completed Jobs */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Total Jobs Completed
                    </span>
                    <span className="font-bold text-foreground">
                      {mechanicProfile.totalJobs}
                    </span>
                  </div>

                  {/* Current Location */}
                  {(mechanicProfile.currentLat !== undefined && mechanicProfile.currentLat !== null) && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-500" /> Last Known Location
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {mechanicProfile.currentLat.toFixed(4)}, {mechanicProfile.currentLng?.toFixed(4)}
                      </span>
                    </div>
                  )}

                  {/* Skills List */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-primary" /> Specialities & Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mechanicProfile.skills && mechanicProfile.skills.length > 0 ? (
                        mechanicProfile.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="rounded-lg text-xs font-medium bg-muted/60"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No specialized skills listed.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No mechanic profile linked.
                </div>
              )}
            </Card>
          </div>

          {/* "My Reviews" Section */}
          <Card className="rounded-2xl border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Customer Job Reviews
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                Reviews and ratings left by customers for your roadside assistance services.
              </CardDescription>
            </div>

            {isReviewsLoading && !reviewsData ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="No reviews yet"
                description="You haven't received any customer reviews for your completed jobs yet."
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <Card
                      key={rev.id}
                      className="rounded-xl border-border/70 bg-muted/20 p-4 space-y-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {rev.customer?.name ?? "Customer"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDate(rev.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {rev.rating}.0
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-muted-foreground italic line-clamp-3 pt-1">
                          &quot;{rev.comment}&quot;
                        </p>
                      )}

                      {rev.serviceRequest?.description && (
                        <div className="text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2 mt-2">
                          <span className="font-medium text-foreground/80">Job: </span>
                          {rev.serviceRequest.description}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Reviews Pagination */}
                {reviewsMeta && <UrlPagination meta={reviewsMeta} />}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
