import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { GetSparePartsQueryInput, SparePart } from "@/lib/types/spare-parts";

export async function getSparePartsServer(
  token: string,
  query?: GetSparePartsQueryInput
): Promise<Paginated<SparePart>> {
  return serverFetch<Paginated<SparePart>>("spare-parts", {
    token,
    query,
  });
}
