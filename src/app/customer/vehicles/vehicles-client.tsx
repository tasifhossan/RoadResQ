"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  Hash,
} from "lucide-react";

import { queryKeys } from "@/lib/api/keys";
import { Paginated, ApiError } from "@/lib/api/types";
import { Vehicle, GetMyVehiclesQueryInput } from "@/lib/types/vehicles";
import {
  createVehicleSchema,
  CreateVehicleSchema,
} from "@/lib/validations/vehicles";
import {
  getMyVehiclesApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
} from "@/lib/api/endpoints/vehicles";
import { toastApiError } from "@/lib/errors";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VehiclesClientProps {
  initialData: Paginated<Vehicle> | null;
  initialError: string | null;
  queryParams: GetMyVehiclesQueryInput;
}

export function VehiclesClient({
  initialData,
  initialError,
  queryParams,
}: VehiclesClientProps) {
  const queryClient = useQueryClient();

  // State for Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // State for Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);

  // TanStack Query for list fetching with initialData
  const queryKey = queryKeys.vehicles.list(queryParams);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getMyVehiclesApi(queryParams),
    initialData: initialData ?? undefined,
  });

  // React Hook Form setup with createVehicleSchema
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<CreateVehicleSchema>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      plateNumber: "",
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingVehicle(null);
    reset({
      make: "",
      model: "",
      plateNumber: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    reset({
      make: vehicle.make,
      model: vehicle.model,
      plateNumber: vehicle.plateNumber,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVehicle(null);
    reset();
  };

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (values: CreateVehicleSchema) => {
      if (editingVehicle) {
        return updateVehicleApi(editingVehicle.id, values);
      } else {
        return createVehicleApi(values);
      }
    },
    onSuccess: () => {
      toast.success(
        editingVehicle
          ? "Vehicle updated successfully"
          : "Vehicle added successfully"
      );
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach((fieldErr) => {
          setError(fieldErr.field as keyof CreateVehicleSchema, {
            type: "server",
            message: fieldErr.message,
          });
        });
      }
      toastApiError(err, editingVehicle ? "Failed to update vehicle" : "Failed to add vehicle");
    },
  });

  const onSubmitForm = (values: CreateVehicleSchema) => {
    saveMutation.mutate(values);
  };

  // Delete Mutation with Optimistic removal and Rollback
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVehicleApi(id),
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vehicles.all() });

      const previousData = queryClient.getQueryData<Paginated<Vehicle>>(queryKey);

      if (previousData) {
        queryClient.setQueryData<Paginated<Vehicle>>(queryKey, {
          ...previousData,
          items: previousData.items.filter((item) => item.id !== idToDelete),
          meta: {
            ...previousData.meta,
            total: Math.max(0, previousData.meta.total - 1),
          },
        });
      }

      return { previousData };
    },
    onError: (err, _idToDelete, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toastApiError(err, "Failed to delete vehicle");
    },
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setDeletingVehicleId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() });
    },
  });

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingVehicleId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingVehicleId) {
      deleteMutation.mutate(deletingVehicleId);
    }
  };

  const vehiclesList = data?.items ?? [];
  const meta = data?.meta;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Vehicles"
        description="Manage your registered vehicles for quick roadside assistance requests."
      >
        <Button
          onClick={handleOpenCreateDialog}
          className="rounded-xl gap-2 shadow-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </PageHeader>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <SearchInput
          placeholder="Search make, model, or plate number..."
          className="w-full sm:max-w-md"
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <VehiclesSkeleton />
      ) : isError || initialError ? (
        <ErrorState
          title="Could not load vehicles"
          description={
            error instanceof Error
              ? error.message
              : initialError || "An unexpected error occurred while fetching your vehicles."
          }
          onRetry={() => refetch()}
        />
      ) : vehiclesList.length === 0 ? (
        <EmptyState
          icon={<Car className="h-8 w-8 text-muted-foreground" />}
          title={queryParams.search ? "No vehicles found" : "No vehicles registered"}
          description={
            queryParams.search
              ? `No results found matching "${queryParams.search}". Try clearing your search filter.`
              : "Register your vehicle to easily request mechanics and track service requests."
          }
          action={
            queryParams.search ? undefined : (
              <Button onClick={handleOpenCreateDialog} className="rounded-xl gap-2 mt-2">
                <Plus className="h-4 w-4" />
                Add Your First Vehicle
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="block sm:hidden space-y-4">
            {vehiclesList.map((vehicle) => (
              <Card key={vehicle.id} className="rounded-2xl border-border shadow-sm overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Added {formatDate(vehicle.createdAt)}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary">
                    <Hash className="h-3 w-3 mr-0.5 inline" />
                    {vehicle.plateNumber}
                  </Badge>
                </CardHeader>
                <CardFooter className="pt-2 pb-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(vehicle)}
                    className="h-8 rounded-lg gap-1 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteConfirm(vehicle.id)}
                    className="h-8 rounded-lg gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden sm:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Make & Model</TableHead>
                  <TableHead className="font-semibold">Plate Number</TableHead>
                  <TableHead className="font-semibold">Date Added</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesList.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Car className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 rounded-lg border-primary/20 bg-primary/5 text-primary">
                        {vehicle.plateNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(vehicle.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(vehicle)}
                          title="Edit vehicle"
                          className="h-8 w-8 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteConfirm(vehicle.id)}
                          title="Delete vehicle"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && <UrlPagination meta={meta} />}
        </>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              {editingVehicle
                ? "Update your vehicle details below."
                : "Enter your vehicle information to register it to your account."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 pt-2">
            <FormField control={control} name="make" label="Make" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="e.g. Toyota, Honda, Ford"
                  className="rounded-xl bg-card border-border shadow-sm"
                />
              )}
            </FormField>

            <FormField control={control} name="model" label="Model" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="e.g. Camry, Civic, F-150"
                  className="rounded-xl bg-card border-border shadow-sm"
                />
              )}
            </FormField>

            <FormField control={control} name="plateNumber" label="Plate Number" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="e.g. ABC-1234"
                  className="rounded-xl bg-card border-border shadow-sm font-mono uppercase"
                />
              )}
            </FormField>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting || saveMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending}
                className="rounded-xl gap-2 font-medium"
              >
                {(isSubmitting || saveMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingVehicle ? "Save Changes" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action will remove the vehicle from your account."
        confirmText="Delete Vehicle"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function VehiclesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Mobile Skeleton Cards */}
      <div className="block sm:hidden space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl border-border p-4 space-y-3">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </Card>
        ))}
      </div>

      {/* Desktop Skeleton Table */}
      <div className="hidden sm:block rounded-2xl border border-border bg-card p-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
