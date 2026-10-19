"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { queryKeys } from "@/lib/api/keys";
import { Availability, Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import { toastApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { GetMechanicReviewsQueryInput, Review } from "@/lib/types/reviews";
import { PublicMechanicListItem } from "@/lib/types/public";
import { updateUserSchema } from "@/lib/validations/users";
import { getMeApi, updateMeApi } from "@/lib/api/endpoints/users";
import { getMechanicReviewsApi } from "@/lib/api/endpoints/reviews";
import { MechanicCard } from "@/components/mechanics/mechanic-card";
import { cn } from "@/lib/utils";

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
  const [bio, setBio] = useState(mechanicProfile?.bio ?? "");
  const [city, setCity] = useState(mechanicProfile?.city ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    mechanicProfile?.yearsExperience !== null && mechanicProfile?.yearsExperience !== undefined
      ? String(mechanicProfile.yearsExperience)
      : ""
  );
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Sync state if user data loads after initial mount
  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setBio(user?.mechanicProfile?.bio ?? "");
    setCity(user?.mechanicProfile?.city ?? "");
    setYearsExperience(
      user?.mechanicProfile?.yearsExperience !== null && user?.mechanicProfile?.yearsExperience !== undefined
        ? String(user.mechanicProfile.yearsExperience)
        : ""
    );
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

    let parsedExp: number | null = null;
    if (yearsExperience.trim() !== "") {
      const num = Number(yearsExperience.trim());
      if (!Number.isInteger(num) || num < 0) {
        errors.yearsExperience = "Years of experience must be a non-negative integer";
      } else {
        parsedExp = num;
      }
    }

    if (bio.length > 400) {
      errors.bio = "Bio must be at most 400 characters";
    }

    const payload = {
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      bio: bio.trim() || null,
      city: city.trim() || null,
      yearsExperience: parsedExp,
    };

    const parseResult = updateUserSchema.safeParse(payload);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          errors[field] = issue.message;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    updateMutation.mutate(payload);
  };

  const reviews = reviewsData?.items ?? [];
  const reviewsMeta = reviewsData?.meta;

  // Live preview mechanic card data
  const parsedExpForPreview =
    yearsExperience.trim() !== "" && !isNaN(Number(yearsExperience)) && Number(yearsExperience) >= 0
      ? parseInt(yearsExperience.trim(), 10)
      : null;

  const previewMechanic: PublicMechanicListItem = {
    id: user?.id ?? "preview-mechanic",
    name: name.trim() || user?.name || "Mechanic Name",
    avatarUrl: null,
    bio: bio.trim() || null,
    city: city.trim() || null,
    skills: mechanicProfile?.skills || [],
    rating: mechanicProfile?.rating || 0,
    totalJobs: mechanicProfile?.totalJobs || 0,
    yearsExperience: parsedExpForPreview,
    availability: (mechanicProfile?.availability as Availability) || "AVAILABLE",
  };

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
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      )}

      {user && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account & Profile Edit Form */}
            <Card className="lg:col-span-2 rounded-xl border-border bg-card shadow-sm p-6 space-y-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Account & Professional Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  Update your contact details, service area, experience, and public bio. Changes reflect live in the preview card.
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
                        disabled={updateMutation.isPending}
                        aria-invalid={Boolean(fieldErrors.name)}
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
                        disabled={updateMutation.isPending}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder="+880 1700000000"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label htmlFor="mechanic-city" className="text-xs font-semibold">
                      Operating City
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="mechanic-city"
                        value={city}
                        disabled={updateMutation.isPending}
                        aria-invalid={Boolean(fieldErrors.city)}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, city: "" }));
                        }}
                        placeholder="e.g. Dhaka"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                    {fieldErrors.city && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.city}</p>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div className="space-y-1.5">
                    <Label htmlFor="mechanic-exp" className="text-xs font-semibold">
                      Years of Experience
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="mechanic-exp"
                        type="number"
                        min="0"
                        step="1"
                        value={yearsExperience}
                        disabled={updateMutation.isPending}
                        aria-invalid={Boolean(fieldErrors.yearsExperience)}
                        onChange={(e) => {
                          setYearsExperience(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, yearsExperience: "" }));
                        }}
                        placeholder="e.g. 5"
                        className="pl-9 rounded-xl"
                      />
                    </div>
                    {fieldErrors.yearsExperience && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.yearsExperience}</p>
                    )}
                  </div>

                  {/* Professional Bio */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mechanic-bio" className="text-xs font-semibold">
                        Professional Bio
                      </Label>
                      <span
                        className={cn(
                          "text-[11px] font-mono",
                          bio.length > 400 ? "text-destructive font-bold" : "text-muted-foreground"
                        )}
                      >
                        {bio.length}/400
                      </span>
                    </div>
                    <Textarea
                      id="mechanic-bio"
                      rows={3}
                      maxLength={400}
                      value={bio}
                      disabled={updateMutation.isPending}
                      aria-invalid={Boolean(fieldErrors.bio)}
                      onChange={(e) => {
                        setBio(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, bio: "" }));
                      }}
                      placeholder="Briefly describe your mechanic expertise, specializations, and roadside service background..."
                      className="rounded-xl resize-none"
                    />
                    {fieldErrors.bio ? (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.bio}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Max 400 characters. This bio is highlighted on your public profile card.
                      </p>
                    )}
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
                        value={user?.email ?? ""}
                        disabled
                        readOnly
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

            {/* Right Column: Live Preview & Professional Metrics */}
            <div className="space-y-6">
              {/* Live Preview of Public Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary" /> Live Public Card Preview
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/20 bg-primary/5">
                    Live Preview
                  </Badge>
                </div>
                <div className="w-full">
                  <MechanicCard mechanic={previewMechanic} />
                </div>
              </div>

              {/* Read-Only Mechanic Profile Metrics */}
              <Card className="rounded-xl border-border bg-card shadow-sm p-6 space-y-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Professional Status
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground pt-1">
                    Live platform rating, activity, and verified skills.
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
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          : mechanicProfile.availability === "BUSY"
                          ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {mechanicProfile.availability}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-orange-600 fill-orange-600 dark:text-orange-400 dark:fill-orange-400" /> Overall Rating
                    </span>
                    <span className="font-bold text-foreground">
                      {mechanicProfile.rating.toFixed(1)} / 5.0
                    </span>
                  </div>

                  {/* Completed Jobs */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Total Jobs Completed
                    </span>
                    <span className="font-bold text-foreground">
                      {mechanicProfile.totalJobs}
                    </span>
                  </div>

                  {/* Current Location */}
                  {(mechanicProfile.currentLat !== undefined && mechanicProfile.currentLat !== null) && (
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> Last Known Location
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
        </div>

        {/* "My Reviews" Section */}
          <Card className="rounded-xl border-border bg-card p-6 shadow-sm space-y-6">
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
                        <div className="flex items-center gap-1 bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold">
                          <Star className="h-3 w-3 fill-orange-600 text-orange-600 dark:fill-orange-400 dark:text-orange-400" />
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
