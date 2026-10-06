import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  CreateSparePartInput,
  GetSparePartsQueryInput,
  SparePart,
  UpdateSparePartInput,
} from "@/lib/types/spare-parts";

export async function getSparePartsApi(
  query?: GetSparePartsQueryInput
): Promise<Paginated<SparePart>> {
  return apiFetch<Paginated<SparePart>>("spare-parts", { query });
}

export async function createSparePartApi(
  data: CreateSparePartInput
): Promise<{ sparePart: SparePart }> {
  return apiFetch<{ sparePart: SparePart }>("spare-parts", {
    method: "POST",
    body: data,
  });
}

export async function updateSparePartApi(
  id: string,
  data: UpdateSparePartInput
): Promise<{ sparePart: SparePart }> {
  return apiFetch<{ sparePart: SparePart }>(`spare-parts/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteSparePartApi(
  id: string
): Promise<{ sparePart: SparePart }> {
  return apiFetch<{ sparePart: SparePart }>(`spare-parts/${id}`, {
    method: "DELETE",
  });
}
