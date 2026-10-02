import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { Vehicle, GetMyVehiclesQueryInput } from "@/lib/types/vehicles";

export async function getMyVehiclesServer(
  token: string,
  query?: GetMyVehiclesQueryInput
): Promise<Paginated<Vehicle>> {
  return serverFetch<Paginated<Vehicle>>("vehicles/me", { token, query });
}
