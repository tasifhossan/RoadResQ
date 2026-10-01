import "server-only";
import { env } from "@/lib/env";
import { ApiError, ApiResponse, FormattedError } from "@/lib/api/types";
import { buildQuery } from "@/lib/api/query";

export interface ServerFetchOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, unknown>;
  token?: string;
  headers?: Record<string, string>;
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, query, token, headers: customHeaders = {} } = options;

  const queryString = buildQuery(query);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${env.BACKEND_URL}${normalizedPath}${queryString}`;

  const headers: Record<string, string> = {
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined = undefined;

  if (body !== undefined && body !== null) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      requestBody = body;
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: requestBody,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let responseData: ApiResponse<T> | undefined;

  try {
    responseData = (await response.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response body (e.g. Vercel 500 HTML error page, 502 Bad Gateway)
  }

  if (!response.ok) {
    const status = response.status;
    const fallbackMessage =
      status === 429
        ? "Too many requests. Please try again later."
        : response.statusText || `Request failed with status ${status}`;

    const message = responseData?.message || fallbackMessage;
    const errors = responseData?.errors as FormattedError[] | undefined;

    throw new ApiError(status, message, errors);
  }

  if (!responseData) {
    return undefined as T;
  }

  return responseData.data as T;
}
