import { apiFetch } from "@/lib/api/client";
import {
  PublicMechanicDetail,
  PublicMechanicsResponse,
  PublicReviewsResponse,
  PublicStats,
} from "@/lib/types/public";
import {
  GetPublicMechanicsQueryInput,
  GetPublicReviewsQueryInput,
} from "@/lib/validations/public";

/**
 * Client-side fetch for public mechanics with search, filters, pagination, and facets.
 * Routes through the /api/bff/public/mechanics gateway.
 */
export async function getPublicMechanicsApi(
  query?: GetPublicMechanicsQueryInput
): Promise<PublicMechanicsResponse> {
  return apiFetch<PublicMechanicsResponse>("public/mechanics", {
    query: query as Record<string, unknown>,
  });
}

/**
 * Client-side fetch for public mechanic detail by user id.
 */
export async function getPublicMechanicByIdApi(
  id: string
): Promise<PublicMechanicDetail & { mechanic?: PublicMechanicDetail }> {
  return apiFetch<PublicMechanicDetail & { mechanic?: PublicMechanicDetail }>(
    `public/mechanics/${id}`
  );
}

/**
 * Client-side fetch for platform aggregated live statistics.
 */
export async function getPublicStatsApi(): Promise<PublicStats> {
  return apiFetch<PublicStats>("public/stats");
}

/**
 * Client-side fetch for latest customer reviews.
 */
export async function getPublicReviewsApi(
  query?: GetPublicReviewsQueryInput
): Promise<PublicReviewsResponse> {
  return apiFetch<PublicReviewsResponse>("public/reviews", {
    query: query as Record<string, unknown>,
  });
}
