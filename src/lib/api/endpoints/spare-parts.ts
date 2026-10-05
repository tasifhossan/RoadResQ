import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import { GetSparePartsQueryInput, SparePart } from "@/lib/types/spare-parts";

export async function getSparePartsApi(
  query?: GetSparePartsQueryInput
): Promise<Paginated<SparePart>> {
  return apiFetch<Paginated<SparePart>>("spare-parts", { query });
}
