import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import { GetMechanicReviewsQueryInput, Review } from "@/lib/types/reviews";

export async function getMechanicReviewsApi(
  mechanicId: string,
  query?: GetMechanicReviewsQueryInput
): Promise<Paginated<Review>> {
  return apiFetch<Paginated<Review>>(`mechanics/${mechanicId}/reviews`, { query });
}
