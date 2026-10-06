"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  UserCheck,
  Calendar,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { UrlPagination } from "@/components/shared/url-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ApiError, Paginated } from "@/lib/api/types";
import {
  GetSparePartsQueryInput,
  SparePart,
} from "@/lib/types/spare-parts";
import {
  createSparePartSchema,
  CreateSparePartInputSchema,
} from "@/lib/validations/spare-parts";
import {
  createSparePartApi,
  deleteSparePartApi,
  getSparePartsApi,
  updateSparePartApi,
} from "@/lib/api/endpoints/spare-parts";
import { toast } from "sonner";

interface AdminSparePartsClientProps {
  initialData: Paginated<SparePart> | null;
  initialError: string | null;
  queryParams: GetSparePartsQueryInput;
}

export function AdminSparePartsClient({
  initialData,
  initialError,
  queryParams,
}: AdminSparePartsClientProps) {
  const queryClient = useQueryClient();

  // Dialog States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [deletingPart, setDeletingPart] = useState<SparePart | null>(null);

  // TanStack Query for catalog fetch
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.spareParts.catalog(queryParams),
    queryFn: () => getSparePartsApi(queryParams),
    initialData: initialData ?? undefined,
  });

  // React Hook Form for Create/Edit (Name catalog only)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<CreateSparePartInputSchema>({
    resolver: zodResolver(createSparePartSchema),
    defaultValues: {
      name: "",
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSparePartInputSchema) => createSparePartApi(data),
    onSuccess: () => {
      toast.success("Catalog spare part created successfully");
      handleCloseFormModal();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.spareParts.catalog(),
      });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach((e) => {
          if (e.field === "name") {
            setError("name", { message: e.message });
          }
        });
      }
      toastApiError(err, "Failed to create spare part");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateSparePartApi(id, { name }),
    onSuccess: () => {
      toast.success("Catalog spare part updated successfully");
      handleCloseFormModal();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.spareParts.catalog(),
      });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        err.errors.forEach((e) => {
          if (e.field === "name") {
            setError("name", { message: e.message });
          }
        });
      }
      toastApiError(err, "Failed to update spare part");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSparePartApi(id),
    onSuccess: () => {
      toast.success("Catalog spare part deleted successfully");
      setDeletingPart(null);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.spareParts.catalog(),
      });
    },
    onError: (err) => {
      toastApiError(err, "Failed to delete spare part");
    },
  });

  const handleOpenCreateModal = () => {
    setEditingPart(null);
    reset({ name: "" });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (part: SparePart) => {
    setEditingPart(part);
    reset({ name: part.name });
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingPart(null);
    reset({ name: "" });
  };

  const onSubmitForm = (values: CreateSparePartInputSchema) => {
    if (editingPart) {
      updateMutation.mutate({ id: editingPart.id, name: values.name.trim() });
    } else {
      createMutation.mutate({ name: values.name.trim() });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingPart) return;
    deleteMutation.mutate(deletingPart.id);
  };

  const spareParts = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Spare Parts Catalog"
        description="Manage global catalog spare parts definitions."
      >
        <Button
          onClick={handleOpenCreateModal}
          className="rounded-xl gap-2 shadow-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Spare Part
        </Button>
      </PageHeader>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          placeholder="Search catalog by name..."
          className="w-full sm:w-80"
        />
      </div>

      {/* Error State */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load spare parts catalog"
          description={
            initialError || (error ? (error as Error).message : "An error occurred")
          }
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <Card className="rounded-2xl border-border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      )}

      {data && (
        <>
          {spareParts.length === 0 ? (
            <Card className="rounded-2xl border-border bg-card p-8 shadow-sm">
              <EmptyState
                icon={<Wrench className="h-8 w-8" />}
                title="No spare parts found"
                description="No catalog spare parts matched your search query."
              />
            </Card>
          ) : (
            <>
              {/* Desktop Table View (sm and above) */}
              <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold">Part Name</TableHead>
                      <TableHead className="font-semibold">Catalog Type</TableHead>
                      <TableHead className="font-semibold">Created Date</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spareParts.map((part) => (
                      <TableRow
                        key={part.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-semibold text-foreground">
                          {part.name}
                        </TableCell>

                        <TableCell>
                          {part.isGlobal ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400 gap-1 font-medium text-xs rounded-full"
                            >
                              <Globe className="h-3 w-3" />
                              Global Catalog
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400 gap-1 font-medium text-xs rounded-full"
                            >
                              <UserCheck className="h-3 w-3" />
                              Mechanic Custom
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(part.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 rounded-xl inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-44">
                              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                                Part Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenEditModal(part)}
                                className="text-xs font-medium cursor-pointer gap-2"
                              >
                                <Pencil className="h-3.5 w-3.5 text-primary" />
                                Edit Name
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingPart(part)}
                                className="text-xs font-medium cursor-pointer text-destructive gap-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Part
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (xs) */}
              <div className="block sm:hidden space-y-3">
                {spareParts.map((part) => (
                  <Card
                    key={part.id}
                    className="rounded-2xl border-border bg-card p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {part.name}
                        </div>
                        <div className="pt-1">
                          {part.isGlobal ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-700 border-blue-500/30 text-xs rounded-full gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Global Catalog
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-700 border-orange-500/30 text-xs rounded-full gap-1"
                            >
                              <UserCheck className="h-3 w-3" />
                              Mechanic Custom
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-xl inline-flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-44">
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(part)}
                            className="text-xs font-medium cursor-pointer gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                            Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingPart(part)}
                            className="text-xs font-medium cursor-pointer text-destructive gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Part
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDate(part.createdAt)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {meta && <UrlPagination meta={meta} />}
            </>
          )}
        </>
      )}

      {/* Create / Edit Modal (Catalog is Name-Only) */}
      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseFormModal();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingPart ? "Edit Catalog Spare Part" : "Add Catalog Spare Part"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              {editingPart
                ? "Update spare part name in the global catalog definition."
                : "Create a new spare part definition available in the global catalog."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 pt-2">
            <FormField control={control} name="name" label="Part Name" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="e.g. Brake Pad Kit"
                  className="rounded-xl bg-card border-border"
                />
              )}
            </FormField>

            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseFormModal}
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                className="rounded-xl gap-2 font-semibold"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingPart ? "Save Changes" : "Create Spare Part"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingPart)}
        onOpenChange={(open) => {
          if (!open) setDeletingPart(null);
        }}
        title="Delete Catalog Spare Part"
        description={`Are you sure you want to delete "${deletingPart?.name}" from the global catalog?`}
        confirmText="Delete Part"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
