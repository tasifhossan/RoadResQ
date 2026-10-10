"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Loader2, Save } from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { UserProfile } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/types";
import { updateUserSchema, UpdateUserSchema } from "@/lib/validations/users";
import { getMeApi, updateMeApi } from "@/lib/api/endpoints/users";
import { toastApiError } from "@/lib/errors";

import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ProfileClientProps {
  initialUser: UserProfile | null;
  initialError: string | null;
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // TanStack Query for user profile fetching with initialData
  const {
    data: userData,
    isLoading,
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
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    values: {
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
    },
  });

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (values: UpdateUserSchema) => {
      // Send strict object with name and phone only
      const payload: UpdateUserSchema = {};
      if (values.name !== undefined) payload.name = values.name;
      if (values.phone !== undefined) payload.phone = values.phone;
      return updateMeApi(payload);
    },
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      queryClient.setQueryData(queryKeys.auth.me(), res.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      router.refresh();
    },
    onError: (err: unknown) => {
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
    updateMutation.mutate(values);
  };

  if (isLoading && !currentUser) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <PageHeader title="Profile Settings" description="View and update your personal details." />
        <Card className="rounded-2xl p-6">
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-muted rounded-md animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Profile Settings"
        description="View and update your personal profile details."
      />

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
              {currentUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{currentUser?.name}</CardTitle>
              <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Account Role: <StatusBadge status={currentUser?.role || "CUSTOMER"} />
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 pt-6">
            {/* Full Name Field (Editable) */}
            <FormField control={control} name="name" label="Full Name" required>
              {(field) => (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    {...field}
                    placeholder="Your full name"
                    className="pl-9 rounded-xl bg-card border-border shadow-sm"
                  />
                </div>
              )}
            </FormField>

            {/* Email Field (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  readOnly
                  className="pl-9 rounded-xl bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>

            {/* Phone Number Field (Editable) */}
            <FormField control={control} name="phone" label="Phone Number" description="Used by mechanics to contact you during service requests.">
              {(field) => (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    {...field}
                    type="tel"
                    placeholder="e.g. +1234567890"
                    value={field.value || ""}
                    className="pl-9 rounded-xl bg-card border-border shadow-sm font-mono"
                  />
                </div>
              )}
            </FormField>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-border pt-4 bg-muted/20">
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="rounded-xl gap-2 font-medium shadow-sm"
            >
              {(isSubmitting || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
