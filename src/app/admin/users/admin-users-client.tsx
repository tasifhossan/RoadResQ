"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Shield,
  UserX,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { FilterSelect } from "@/components/shared/filter-select";
import { UrlPagination } from "@/components/shared/url-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/lib/api/keys";
import { formatDate } from "@/lib/format";
import { toastApiError } from "@/lib/errors";
import { Paginated, Role, ROLES } from "@/lib/api/types";
import { AdminUserItem, GetUsersQueryInput } from "@/lib/types/admin";
import {
  deactivateUserApi,
  getAllUsersApi,
  reactivateUserApi,
  updateUserRoleApi,
} from "@/lib/api/endpoints/admin";
import { toast } from "sonner";

interface AdminUsersClientProps {
  initialData: Paginated<AdminUserItem> | null;
  initialError: string | null;
  queryParams: GetUsersQueryInput;
  currentUserId?: string;
}

export function AdminUsersClient({
  initialData,
  initialError,
  queryParams,
  currentUserId,
}: AdminUsersClientProps) {
  const queryClient = useQueryClient();

  // Dialog State
  const [roleUser, setRoleUser] = useState<AdminUserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("CUSTOMER");

  const [deactivateUserTarget, setDeactivateUserTarget] = useState<AdminUserItem | null>(null);

  // TanStack Query list fetch
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.users.all(queryParams),
    queryFn: () => getAllUsersApi(queryParams),
    initialData: initialData ?? undefined,
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      updateUserRoleApi(userId, { role }),
    onSuccess: (_, variables) => {
      toast.success(`User role updated to ${variables.role}`);
      setRoleUser(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to update user role");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateUserApi(userId),
    onSuccess: () => {
      toast.success("User deactivated successfully");
      setDeactivateUserTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to deactivate user");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (userId: string) => reactivateUserApi(userId),
    onSuccess: () => {
      toast.success("User reactivated successfully");
      setDeactivateUserTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    onError: (err) => {
      toastApiError(err, "Failed to reactivate user");
    },
  });

  const handleOpenRoleModal = (user: AdminUserItem) => {
    setRoleUser(user);
    setSelectedRole(user.role);
  };

  const handleConfirmRoleChange = () => {
    if (!roleUser) return;
    updateRoleMutation.mutate({ userId: roleUser.id, role: selectedRole });
  };

  const handleConfirmDeactivation = () => {
    if (!deactivateUserTarget) return;
    if (deactivateUserTarget.deletedAt) {
      reactivateMutation.mutate(deactivateUserTarget.id);
    } else {
      deactivateMutation.mutate(deactivateUserTarget.id);
    }
  };

  const users = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="User Management"
        description="View system users, update roles, and manage user account activations."
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput placeholder="Search name or email..." className="w-full sm:w-64" />
          <FilterSelect
            paramName="role"
            placeholder="Filter Role"
            allLabel="All Roles"
            options={[
              { label: "Customer", value: "CUSTOMER" },
              { label: "Mechanic", value: "MECHANIC" },
              { label: "Admin", value: "ADMIN" },
            ]}
          />
          <FilterSelect
            paramName="isActive"
            placeholder="Filter Status"
            allLabel="All Statuses"
            options={[
              { label: "Active", value: "true" },
              { label: "Deactivated", value: "false" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
          <FilterSelect
            paramName="sortBy"
            placeholder="Sort By"
            defaultValue="createdAt"
            showAllOption={false}
            options={[
              { label: "Date Created", value: "createdAt" },
              { label: "Name", value: "name" },
            ]}
            className="w-36"
          />
          <FilterSelect
            paramName="sortOrder"
            placeholder="Order"
            defaultValue="desc"
            showAllOption={false}
            options={[
              { label: "Descending", value: "desc" },
              { label: "Ascending", value: "asc" },
            ]}
            className="w-32"
          />
        </div>
      </div>

      {/* Error state */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load users list"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="space-y-4">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </Card>
        </div>
      )}

      {data && (
        <>
          {users.length === 0 ? (
            <Card className="rounded-2xl border-border bg-card p-8 shadow-sm">
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="No users found"
                description="No users matched your active search or filter criteria."
              />
            </Card>
          ) : (
            <>
              {/* Desktop Table View (sm and above) */}
              <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const isSelf = user.id === currentUserId;
                      const isDeactivated = Boolean(user.deletedAt);

                      return (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                  {user.name}
                                  {isSelf && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md bg-primary/15 text-primary border-0 font-medium">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {user.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                {user.phone}
                              </div>
                            ) : (
                              <span className="italic opacity-70">No phone</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={user.role} />
                          </TableCell>

                          <TableCell>
                            {isDeactivated ? (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400 gap-1 font-medium text-xs rounded-full">
                                <XCircle className="h-3 w-3" />
                                Deactivated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 gap-1 font-medium text-xs rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 rounded-xl inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl w-48">
                                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                                  User Options
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleOpenRoleModal(user)}
                                  className="text-xs font-medium cursor-pointer gap-2"
                                >
                                  <Shield className="h-3.5 w-3.5 text-primary" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeactivateUserTarget(user)}
                                  disabled={isSelf && !isDeactivated}
                                  className={user.deletedAt ? "text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400 gap-2" : "text-xs font-medium cursor-pointer text-destructive gap-2"}
                                >
                                  {user.deletedAt ? (
                                    <>
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      Reactivate User
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-3.5 w-3.5" />
                                      Deactivate User
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (xs) */}
              <div className="block sm:hidden space-y-3">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isDeactivated = Boolean(user.deletedAt);

                  return (
                    <Card key={user.id} className="rounded-2xl border-border bg-card p-4 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              {user.name}
                              {isSelf && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md bg-primary/15 text-primary border-0">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 rounded-xl inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuItem onClick={() => handleOpenRoleModal(user)} className="text-xs font-medium cursor-pointer gap-2">
                              <Shield className="h-3.5 w-3.5 text-primary" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeactivateUserTarget(user)}
                              disabled={isSelf && !isDeactivated}
                              className={user.deletedAt ? "text-xs font-medium cursor-pointer text-emerald-600 gap-2" : "text-xs font-medium cursor-pointer text-destructive gap-2"}
                            >
                              {user.deletedAt ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Reactivate User
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3.5 w-3.5" />
                                  Deactivate User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <StatusBadge status={user.role} />
                        {isDeactivated ? (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/30 text-xs rounded-full">
                            Deactivated
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs rounded-full">
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDate(user.createdAt)}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && <UrlPagination meta={meta} />}
            </>
          )}
        </>
      )}

      {/* Role Change Modal */}
      <ConfirmDialog
        open={Boolean(roleUser)}
        onOpenChange={(open) => {
          if (!open) setRoleUser(null);
        }}
        title="Update User Role"
        description={`Modify system access role for ${roleUser?.name ?? "user"}.`}
        confirmText="Save Role"
        loading={updateRoleMutation.isPending}
        onConfirm={handleConfirmRoleChange}
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select New Role
            </label>
            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as Role)}>
              <SelectTrigger className="rounded-xl bg-card border-border">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {roleUser?.role === "MECHANIC" && selectedRole !== "MECHANIC" && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Mechanic Demotion Notice:</strong> Demoting a mechanic currently assigned to active jobs will be rejected by the backend.
              </span>
            </div>
          )}
        </div>
      </ConfirmDialog>

      {/* Deactivate / Reactivate Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deactivateUserTarget)}
        onOpenChange={(open) => {
          if (!open) setDeactivateUserTarget(null);
        }}
        title={deactivateUserTarget?.deletedAt ? "Reactivate User Account" : "Deactivate User Account"}
        description={
          deactivateUserTarget?.deletedAt
            ? `Are you sure you want to reactivate ${deactivateUserTarget?.name}'s account? They will regain access to the platform.`
            : `Are you sure you want to deactivate ${deactivateUserTarget?.name}'s account? They will no longer be able to log in.`
        }
        confirmText={deactivateUserTarget?.deletedAt ? "Reactivate" : "Deactivate"}
        variant={deactivateUserTarget?.deletedAt ? "default" : "destructive"}
        loading={deactivateMutation.isPending || reactivateMutation.isPending}
        onConfirm={handleConfirmDeactivation}
      >
        {deactivateUserTarget?.role === "MECHANIC" && !deactivateUserTarget?.deletedAt && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2 mt-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Deactivating a mechanic with active roadside jobs will be rejected by the backend until active jobs are finished.
            </span>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
