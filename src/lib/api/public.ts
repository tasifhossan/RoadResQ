import "server-only";
import { env } from "@/lib/env";
import { ApiError, ApiResponse, FormattedError } from "@/lib/api/types";
import { buildQuery } from "@/lib/api/query";
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

export interface PublicFetchOptions {
  method?: string;
  query?: Record<string, unknown>;
  revalidate?: number;
  headers?: Record<string, string>;
}

/**
 * Server-only fetch function for public endpoints.
 * Calls backend directly without an authorization token and applies Next.js ISR/cache revalidation.
 */
export async function publicFetch<T>(
  path: string,
  options: PublicFetchOptions = {}
): Promise<T> {
  const { method = "GET", query, revalidate = 60, headers: customHeaders = {} } = options;

  const queryString = buildQuery(query);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${env.BACKEND_URL}${normalizedPath}${queryString}`;

  const headers: Record<string, string> = {
    ...customHeaders,
  };

  const response = await fetch(url, {
    method,
    headers,
    next: { revalidate },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let responseData: ApiResponse<T> | undefined;

  try {
    responseData = (await response.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response body (e.g. 500 HTML error page, 502 Bad Gateway)
  }

  if (!response.ok) {
    const status = response.status;
    const fallbackMessage =
      status === 429
        ? "Too many requests. Please try again later."
        : response.statusText || `Request failed with status ${status}`;

    let message = responseData?.message || fallbackMessage;
    if (message.includes("Can't reach database server") || message.includes("prisma.")) {
      message = "Database server is temporarily unreachable. Please try again in a few seconds.";
    }
    const errors = responseData?.errors as FormattedError[] | undefined;

    throw new ApiError(status, message, errors);
  }

  if (!responseData) {
    return undefined as T;
  }

  return responseData.data as T;
}

/**
 * Server fetch helper for public mechanics list (30s revalidation).
 */
export async function getPublicMechanicsServer(
  query?: GetPublicMechanicsQueryInput
): Promise<PublicMechanicsResponse> {
  return publicFetch<PublicMechanicsResponse>("public/mechanics", {
    query: query as Record<string, unknown>,
    revalidate: 30,
  });
}

/**
 * Server fetch helper for public mechanic detail by user id (60s revalidation).
 */
export async function getPublicMechanicByIdServer(
  id: string
): Promise<PublicMechanicDetail & { mechanic?: PublicMechanicDetail }> {
  return publicFetch<PublicMechanicDetail & { mechanic?: PublicMechanicDetail }>(
    `public/mechanics/${id}`,
    {
      revalidate: 60,
    }
  );
}

/**
 * Server fetch helper for public aggregated live platform statistics (60s revalidation).
 */
export async function getPublicStatsServer(): Promise<PublicStats> {
  return publicFetch<PublicStats>("public/stats", {
    revalidate: 60,
  });
}

/**
 * Server fetch helper for public customer reviews (60s revalidation).
 */
export async function getPublicReviewsServer(
  query?: GetPublicReviewsQueryInput
): Promise<PublicReviewsResponse> {
  return publicFetch<PublicReviewsResponse>("public/reviews", {
    query: query as Record<string, unknown>,
    revalidate: 60,
  });
}
