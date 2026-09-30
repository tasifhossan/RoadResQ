import { ApiError, ApiResponse, FormattedError } from "@/lib/api/types";
import { buildQuery } from "@/lib/api/query";

export interface ClientFetchOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  path: string,
  options: ClientFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, query, headers: customHeaders = {} } = options;

  const queryString = buildQuery(query);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `/api/proxy/${normalizedPath}${queryString}`;

  const headers: Record<string, string> = {
    ...customHeaders,
  };

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
  });

  let responseData: ApiResponse<T> | undefined;

  try {
    responseData = (await response.json()) as ApiResponse<T>;
  } catch {
    // If response body is not JSON
  }

  if (!response.ok) {
    const status = response.status;
    const message = responseData?.message || response.statusText || `Request failed with status ${status}`;
    const errors = responseData?.errors as FormattedError[] | undefined;

    throw new ApiError(status, message, errors);
  }

  if (!responseData) {
    throw new ApiError(response.status, "Empty or non-JSON response received from server");
  }

  return responseData.data as T;
}
