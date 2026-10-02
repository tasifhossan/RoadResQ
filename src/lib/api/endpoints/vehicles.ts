import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  Vehicle,
  GetMyVehiclesQueryInput,
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/lib/types/vehicles";

export async function getMyVehiclesApi(
  query?: GetMyVehiclesQueryInput
): Promise<Paginated<Vehicle>> {
  return apiFetch<Paginated<Vehicle>>("vehicles/me", { query });
}

export async function getVehicleByIdApi(id: string): Promise<{ vehicle: Vehicle }> {
  return apiFetch<{ vehicle: Vehicle }>(`vehicles/${id}`);
}

export async function createVehicleApi(
  data: CreateVehicleInput
): Promise<{ vehicle: Vehicle }> {
  return apiFetch<{ vehicle: Vehicle }>("vehicles", {
    method: "POST",
    body: data,
  });
}

export async function updateVehicleApi(
  id: string,
  data: UpdateVehicleInput
): Promise<{ vehicle: Vehicle }> {
  return apiFetch<{ vehicle: Vehicle }>(`vehicles/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteVehicleApi(
  id: string
): Promise<{ vehicle: Vehicle }> {
  return apiFetch<{ vehicle: Vehicle }>(`vehicles/${id}`, {
    method: "DELETE",
  });
}
