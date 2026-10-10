"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Box,
  Check,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryKeys } from "@/lib/api/keys";
import { Paginated } from "@/lib/api/types";
import { toastApiError } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { GetInventoryQueryInput, MechanicInventoryItem } from "@/lib/types/mechanics";
import { SparePart } from "@/lib/types/spare-parts";
import { LOW_STOCK_THRESHOLD } from "@/lib/validations/mechanic-inventory";
import {
  addInventoryItemApi,
  getMechanicInventoryApi,
  removeInventoryItemApi,
  updateInventoryItemApi,
} from "@/lib/api/endpoints/mechanics";
import { getSparePartsApi } from "@/lib/api/endpoints/spare-parts";

interface MechanicInventoryClientProps {
  initialData: Paginated<MechanicInventoryItem> | null;
  initialError: string | null;
  queryParams: GetInventoryQueryInput;
}

export function MechanicInventoryClient({
  initialData,
  initialError,
  queryParams,
}: MechanicInventoryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<"catalog" | "custom">("catalog");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogPart, setSelectedCatalogPart] = useState<SparePart | null>(null);
  const [customPartName, setCustomPartName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addStock, setAddStock] = useState("");
  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});

  // Edit State
  const [editingItem, setEditingItem] = useState<MechanicInventoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  // Delete State
  const [deletingItem, setDeletingItem] = useState<MechanicInventoryItem | null>(null);

  // TanStack Query for Mechanic Inventory List
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.mechanics.inventory(queryParams),
    queryFn: () => getMechanicInventoryApi(queryParams),
    initialData: initialData ?? undefined,
  });

  // TanStack Query for Spare Parts Catalog search
  const { data: catalogData, isLoading: isCatalogLoading } = useQuery({
    queryKey: queryKeys.spareParts.catalog({ search: catalogSearch }),
    queryFn: () => getSparePartsApi({ search: catalogSearch, limit: 20 }),
    enabled: isAddOpen && addTab === "catalog",
  });

  // Add Item Mutation
  const addMutation = useMutation({
    mutationFn: addInventoryItemApi,
    onSuccess: () => {
      toast.success("Part added to inventory successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.mechanics.inventory() });
      resetAddForm();
      setIsAddOpen(false);
    },
    onError: (err) => {
      toastApiError(err);
    },
  });

  // Update Item Mutation
  const updateMutation = useMutation({
    mutationFn: ({
      sparePartId,
      body,
    }: {
      sparePartId: string;
      body: { name?: string; price?: number; stock?: number };
    }) => updateInventoryItemApi(sparePartId, body),
    onSuccess: () => {
      toast.success("Inventory item updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.mechanics.inventory() });
      setEditingItem(null);
    },
    onError: (err) => {
      toastApiError(err);
    },
  });

  // Delete Item Mutation
  const deleteMutation = useMutation({
    mutationFn: (sparePartId: string) => removeInventoryItemApi(sparePartId),
    onSuccess: () => {
      toast.success("Item removed from inventory");
      queryClient.invalidateQueries({ queryKey: queryKeys.mechanics.inventory() });
      setDeletingItem(null);
    },
    onError: (err) => {
      toastApiError(err);
    },
  });

  const resetAddForm = () => {
    setAddTab("catalog");
    setCatalogSearch("");
    setSelectedCatalogPart(null);
    setCustomPartName("");
    setAddPrice("");
    setAddStock("");
    setAddErrors({});
  };

  const handleToggleLowStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (queryParams.lowStock) {
      params.delete("lowStock");
    } else {
      params.set("lowStock", "true");
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    const priceNum = parseFloat(addPrice);
    if (addPrice.trim() === "" || isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price must be greater than or equal to 0";
    }

    const stockNum = parseInt(addStock, 10);
    if (
      addStock.trim() === "" ||
      isNaN(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(Number(addStock))
    ) {
      errors.stock = "Stock must be a non-negative integer";
    }

    if (addTab === "catalog") {
      if (!selectedCatalogPart) {
        errors.sparePartId = "Please select a catalog part";
      }
    } else {
      if (!customPartName.trim()) {
        errors.name = "Part name is required";
      }
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setAddErrors({});
    if (addTab === "catalog" && selectedCatalogPart) {
      addMutation.mutate({
        sparePartId: selectedCatalogPart.id,
        price: priceNum,
        stock: stockNum,
      });
    } else {
      addMutation.mutate({
        name: customPartName.trim(),
        price: priceNum,
        stock: stockNum,
      });
    }
  };

  const handleOpenEdit = (item: MechanicInventoryItem) => {
    setEditingItem(item);
    setEditName(item.sparePart.name);
    setEditPrice(item.price.toString());
    setEditStock(item.stock.toString());
    setEditErrors({});
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const errors: { [key: string]: string } = {};

    const isCustomPart =
      !editingItem.sparePart.isGlobal && editingItem.sparePart.createdByMechanicId;

    if (isCustomPart && !editName.trim()) {
      errors.name = "Part name cannot be empty";
    }

    const priceNum = parseFloat(editPrice);
    if (editPrice.trim() === "" || isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price must be greater than or equal to 0";
    }

    const stockNum = parseInt(editStock, 10);
    if (
      editStock.trim() === "" ||
      isNaN(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(Number(editStock))
    ) {
      errors.stock = "Stock must be a non-negative integer";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditErrors({});

    const body: { name?: string; price?: number; stock?: number } = {
      price: priceNum,
      stock: stockNum,
    };

    if (isCustomPart && editName.trim() !== editingItem.sparePart.name) {
      body.name = editName.trim();
    }

    updateMutation.mutate({
      sparePartId: editingItem.sparePartId,
      body,
    });
  };

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Spare Parts Inventory"
        description="Manage your inventory, set pricing, update stock levels, and monitor low-stock items."
      >
        <Button onClick={handleOpenAdd} className="rounded-xl gap-2 font-medium shadow-sm">
          <Plus className="h-4 w-4" />
          Add Inventory Item
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          placeholder="Search by part name..."
          paramName="search"
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant={queryParams.lowStock ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLowStock}
            className="rounded-xl gap-2 text-xs sm:text-sm font-medium"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {queryParams.lowStock ? "Showing Low Stock" : "Filter Low Stock"}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {(isError || initialError) && !data && (
        <ErrorState
          title="Failed to load inventory"
          description={initialError || (error ? (error as Error).message : "An error occurred")}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {/* Skeleton loading state */}
      {isLoading && !data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Content View */}
      {data && (
        <>
          {items.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No inventory items found"
              description={
                queryParams.search || queryParams.lowStock
                  ? "No parts match your search criteria or low stock filter."
                  : "You haven't added any spare parts to your inventory yet."
              }
              action={
                <Button
                  onClick={
                    queryParams.search || queryParams.lowStock
                      ? () => router.push(pathname)
                      : handleOpenAdd
                  }
                  variant="outline"
                  className="rounded-xl"
                >
                  {queryParams.search || queryParams.lowStock
                    ? "Clear Filters"
                    : "Add First Item"}
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold">Part Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Stock Level</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      // LOW_STOCK_THRESHOLD = 5 constant mirrored from backend/src/modules/mechanic-inventory/mechanic-inventory.service.ts
                      const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Box className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-foreground font-semibold">
                                {item.sparePart.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.sparePart.isGlobal ? (
                              <Badge variant="secondary" className="rounded-lg text-xs font-normal">
                                Catalog Part
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-lg text-xs font-normal border-primary/30 text-primary">
                                <Sparkles className="h-3 w-3 mr-1" /> Custom Part
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatMoney(item.price)}
                          </TableCell>
                          <TableCell className="font-medium">{item.stock} units</TableCell>
                          <TableCell>
                            {/* Low stock indicator threshold mirrored from backend */}
                            {isLowStock ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs rounded-full px-2.5 py-0.5"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs rounded-full px-2.5 py-0.5"
                              >
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="rounded-xl h-8 px-2.5 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingItem(item)}
                                className="rounded-xl h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {items.map((item) => {
                  const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;

                  return (
                    <Card key={item.id} className="rounded-2xl border-border shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-bold flex items-center gap-1.5">
                              <Box className="h-4 w-4 text-primary shrink-0" />
                              {item.sparePart.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {item.sparePart.isGlobal ? "Catalog Part" : "Custom Part"}
                            </CardDescription>
                          </div>
                          {isLowStock ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs rounded-full"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs rounded-full"
                            >
                              In Stock
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 pb-3 text-sm space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Unit Price:</span>
                          <span className="font-semibold text-foreground text-sm">
                            {formatMoney(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Current Stock:</span>
                          <span className="font-semibold text-foreground text-sm">
                            {item.stock} units
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-3 pt-0 flex justify-end gap-2 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-xl h-8 text-xs gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingItem(item)}
                          className="rounded-xl h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* URL Pagination */}
              {meta && <UrlPagination meta={meta} />}
            </>
          )}
        </>
      )}

      {/* Add Inventory Item Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Spare Part to Inventory</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a part from the global catalog or create a custom spare part.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <Tabs
              value={addTab}
              onValueChange={(val) => {
                setAddTab(val as "catalog" | "custom");
                setAddErrors({});
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 rounded-xl mb-4">
                <TabsTrigger value="catalog" className="rounded-lg text-xs sm:text-sm">
                  Global Catalog
                </TabsTrigger>
                <TabsTrigger value="custom" className="rounded-lg text-xs sm:text-sm">
                  Custom Part
                </TabsTrigger>
              </TabsList>

              {/* Catalog Part Selection */}
              <TabsContent value="catalog" className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="catalog-search" className="text-xs font-semibold">
                    Search Catalog
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="catalog-search"
                      placeholder="Type to search global catalog..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-2 space-y-1 bg-muted/20">
                  {isCatalogLoading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                      Loading catalog parts...
                    </div>
                  ) : !catalogData || catalogData.items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No catalog parts found. Switch to &quot;Custom Part&quot; tab to add your own.
                    </div>
                  ) : (
                    catalogData.items.map((part) => {
                      const isSelected = selectedCatalogPart?.id === part.id;
                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => {
                            setSelectedCatalogPart(part);
                            setAddErrors((prev) => ({ ...prev, sparePartId: "" }));
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{part.name}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
                {addErrors.sparePartId && (
                  <p className="text-xs text-destructive font-medium">{addErrors.sparePartId}</p>
                )}
              </TabsContent>

              {/* Custom Part Creation */}
              <TabsContent value="custom" className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-part-name" className="text-xs font-semibold">
                    Custom Part Name
                  </Label>
                  <Input
                    id="custom-part-name"
                    placeholder="e.g., Heavy Duty Tow Cable 20ft"
                    value={customPartName}
                    onChange={(e) => {
                      setCustomPartName(e.target.value);
                      setAddErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className="rounded-xl"
                  />
                  {addErrors.name && (
                    <p className="text-xs text-destructive font-medium">{addErrors.name}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Price & Stock Fields */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-price" className="text-xs font-semibold">
                  Unit Price (BDT)
                </Label>
                <Input
                  id="add-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={addPrice}
                  onChange={(e) => {
                    setAddPrice(e.target.value);
                    setAddErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  className="rounded-xl"
                />
                {addErrors.price && (
                  <p className="text-xs text-destructive font-medium">{addErrors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-stock" className="text-xs font-semibold">
                  Initial Stock
                </Label>
                <Input
                  id="add-stock"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={addStock}
                  onChange={(e) => {
                    setAddStock(e.target.value);
                    setAddErrors((prev) => ({ ...prev, stock: "" }));
                  }}
                  className="rounded-xl"
                />
                {addErrors.stock && (
                  <p className="text-xs text-destructive font-medium">{addErrors.stock}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl"
                disabled={addMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl gap-2 font-medium"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add to Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Item Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Inventory Item</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update pricing and stock levels for {editingItem?.sparePart.name}.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              {/* If custom part, allow editing name. Otherwise show disabled catalog name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  Part Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setEditErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  disabled={
                    editingItem.sparePart.isGlobal ||
                    !editingItem.sparePart.createdByMechanicId
                  }
                  className="rounded-xl"
                />
                {editingItem.sparePart.isGlobal && (
                  <p className="text-[11px] text-muted-foreground">
                    Catalog part names cannot be changed.
                  </p>
                )}
                {editErrors.name && (
                  <p className="text-xs text-destructive font-medium">{editErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-price" className="text-xs font-semibold">
                    Unit Price (BDT)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      setEditErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    className="rounded-xl"
                  />
                  {editErrors.price && (
                    <p className="text-xs text-destructive font-medium">{editErrors.price}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-stock" className="text-xs font-semibold">
                    Current Stock
                  </Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => {
                      setEditStock(e.target.value);
                      setEditErrors((prev) => ({ ...prev, stock: "" }));
                    }}
                    className="rounded-xl"
                  />
                  {editErrors.stock && (
                    <p className="text-xs text-destructive font-medium">{editErrors.stock}</p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl gap-2 font-medium"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title="Remove Inventory Item"
        description={`Are you sure you want to remove "${deletingItem?.sparePart.name}" from your inventory?`}
        confirmText="Remove Item"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingItem) {
            deleteMutation.mutate(deletingItem.sparePartId);
          }
        }}
      />
    </div>
  );
}
