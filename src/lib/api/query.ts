/**
 * Builds a clean query string from an object, dropping undefined, null, and empty string values.
 * Backend validates query parameters strictly and rejects unknown or empty values with HTTP 400.
 */
export function buildQuery(obj?: Record<string, unknown>): string {
  if (!obj) return "";

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      }
    } else {
      params.append(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}
