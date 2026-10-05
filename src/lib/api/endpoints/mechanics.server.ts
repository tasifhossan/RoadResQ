import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { EarningsSummary, GetInventoryQueryInput, MechanicInventoryItem } from "@/lib/types/mechanics";

export async function getEarningsSummaryServer(
  token: string
): Promise<EarningsSummary> {
  return serverFetch<EarningsSummary>("mechanics/me/earnings", {
    token,
  });
}

export async function getMechanicInventoryServer(
  token: string,
  query?: GetInventoryQueryInput
): Promise<Paginated<MechanicInventoryItem>> {
  return serverFetch<Paginated<MechanicInventoryItem>>("mechanics/me/inventory", {
    token,
    query,
  });
}
