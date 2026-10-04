import "server-only";
import { serverFetch } from "@/lib/api/server";
import { EarningsSummary } from "@/lib/types/mechanics";

export async function getEarningsSummaryServer(
  token: string
): Promise<EarningsSummary> {
  return serverFetch<EarningsSummary>("mechanics/me/earnings", {
    token,
  });
}
