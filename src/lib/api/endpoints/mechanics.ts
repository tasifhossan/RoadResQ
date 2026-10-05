import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import {
  AddInventoryItemInput,
  EarningsSummary,
  GetInventoryQueryInput,
  MechanicInventoryItem,
  RestockInventoryItemInput,
  UpdateAvailabilityInput,
  UpdateInventoryItemInput,
  UpdateLocationInput,
} from "@/lib/types/mechanics";

export async function updateAvailabilityApi(
  data: UpdateAvailabilityInput
): Promise<{ mechanicProfile: NonNullable<UserProfile["mechanicProfile"]> }> {
  return apiFetch<{ mechanicProfile: NonNullable<UserProfile["mechanicProfile"]> }>(
    "mechanics/me/availability",
    {
      method: "PATCH",
      body: data,
    }
  );
}

export async function updateLocationApi(
  data: UpdateLocationInput
): Promise<{ mechanicProfile: NonNullable<UserProfile["mechanicProfile"]> }> {
  return apiFetch<{ mechanicProfile: NonNullable<UserProfile["mechanicProfile"]> }>(
    "mechanics/me/location",
    {
      method: "PATCH",
      body: data,
    }
  );
}

export async function getEarningsSummaryApi(): Promise<EarningsSummary> {
  return apiFetch<EarningsSummary>("mechanics/me/earnings");
}

export async function getMechanicInventoryApi(
  query?: GetInventoryQueryInput
): Promise<Paginated<MechanicInventoryItem>> {
  return apiFetch<Paginated<MechanicInventoryItem>>("mechanics/me/inventory", { query });
}

export async function addInventoryItemApi(
  data: AddInventoryItemInput
): Promise<MechanicInventoryItem> {
  return apiFetch<MechanicInventoryItem>("mechanics/me/inventory", {
    method: "POST",
    body: data,
  });
}

export async function updateInventoryItemApi(
  sparePartId: string,
  data: UpdateInventoryItemInput
): Promise<MechanicInventoryItem> {
  return apiFetch<MechanicInventoryItem>(`mechanics/me/inventory/${sparePartId}`, {
    method: "PATCH",
    body: data,
  });
}

export async function restockInventoryItemApi(
  sparePartId: string,
  data: RestockInventoryItemInput
): Promise<MechanicInventoryItem> {
  return apiFetch<MechanicInventoryItem>(`mechanics/me/inventory/${sparePartId}/restock`, {
    method: "PATCH",
    body: data,
  });
}

export async function removeInventoryItemApi(
  sparePartId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`mechanics/me/inventory/${sparePartId}`, {
    method: "DELETE",
  });
}
