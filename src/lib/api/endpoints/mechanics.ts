import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";
import {
  EarningsSummary,
  GetInventoryQueryInput,
  MechanicInventoryItem,
  UpdateAvailabilityInput,
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
