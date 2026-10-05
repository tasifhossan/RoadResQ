import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { GetMechanicReviewsQueryInput, Review } from "@/lib/types/reviews";

export async function getMechanicReviewsServer(
  token: string,
  mechanicId: string,
  query?: GetMechanicReviewsQueryInput
): Promise<Paginated<Review>> {
  return serverFetch<Paginated<Review>>(`mechanics/${mechanicId}/reviews`, {
    token,
    query,
  });
}
