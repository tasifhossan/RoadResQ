"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { UserProfile } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/types";
import { updateUserSchema, UpdateUserSchema } from "@/lib/validations/users";
import { getMeApi, updateMeApi } from "@/lib/api/endpoints/users";
import { toastApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminProfileClientProps {
  initialUser: UserProfile | null;
  initialError: string | null;
}

export function AdminProfileClient({ initialUser, initialError }: AdminProfileClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // TanStack Query for user profile fetching with initialData
  const {
    data: userData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await getMeApi();
      return res.user;
    },
    initialData: initialUser ?? undefined,
  });

  const currentUser = userData ?? initialUser;

  // React Hook Form with strict updateUserSchema
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    values: {
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
    },
  });

  // Mutation for updating profile (strict schema: name, phone)
  const updateMutation = useMutation({
    mutationFn: (values: UpdateUserSchema) => {
      const payload: UpdateUserSchema = {};
      if (values.name !== undefined) payload.name = values.name;
      if (values.phone !== undefined) payload.phone = values.phone;
      return updateMeApi(payload);
    },
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      setSuccessMessage("Your profile information has been saved successfully.");
      queryClient.setQueryData(queryKeys.auth.me(), res.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      reset({
        name: res.user.name,
        phone: res.user.phone || "",
      });
      router.refresh();
    },
    onError: (err: unknown) => {
      setSuccessMessage(null);
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach((fieldErr) => {
          setError(fieldErr.field as keyof UpdateUserSchema, {
            type: "server",
            message: fieldErr.message,
          });
        });
      }
      toastApiError(err, "Failed to update profile");
    },
  });

  const onSubmit = (values: UpdateUserSchema) => {
    setSuccessMessage(null);
    updateMutation.mutate(values);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader
          title="Admin Profile"
          description="Administrator account details, role permissions, and contact information."
        />
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if ((isError || initialError) && !currentUser) {
    return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader
          title="Admin Profile"
          description="Administrator account details, role permissions, and contact information."
        />
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <ErrorState
            title="Failed to load profile"
            description={
              error instanceof Error
                ? error.message
                : initialError || "Could not retrieve administrator profile details."
            }
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Admin Profile"
        description="Administrator account details, role permissions, and contact information."
      />

      {/* Profile Overview Card */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {currentUser?.name || "Administrator"}
                </h2>
                {currentUser?.role && <StatusBadge status={currentUser.role} />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Full System Administrator Access</span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="admin-name"
                type="text"
                disabled={updateMutation.isPending}
                placeholder="Enter full name"
                className="rounded-xl text-xs bg-background border-border"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="admin-phone"
                type="tel"
                disabled={updateMutation.isPending}
                placeholder="e.g. +880 1712 345678"
                className="rounded-xl text-xs bg-background border-border"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Read-Only Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Email Address (Read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Read-only
                </span>
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="rounded-xl text-xs bg-muted/40 border-border text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Member Since (Read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-created" className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Account Created
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Read-only
                </span>
              </Label>
              <Input
                id="admin-created"
                type="text"
                value={currentUser?.createdAt ? formatDate(currentUser.createdAt) : "N/A"}
                disabled
                className="rounded-xl text-xs bg-muted/40 border-border text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              {isDirty ? "Unsaved changes detected" : "All profile information is up to date"}
            </p>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="gap-2 rounded-xl text-xs h-9 px-4"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
