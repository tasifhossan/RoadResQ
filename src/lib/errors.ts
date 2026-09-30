import { toast } from "sonner";
import { ApiError } from "@/lib/api/types";

/**
 * Extracts a human-readable error message string from any caught error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "An unexpected error occurred.";
}

/**
 * Displays a toast notification with the main error message and individual field errors if available.
 */
export function toastApiError(error: unknown, fallbackMessage = "Operation failed"): void {
  const message = getErrorMessage(error);
  const finalMessage = message || fallbackMessage;

  if (error instanceof ApiError && error.errors && error.errors.length > 0) {
    const fieldDetails = error.errors
      .map((err) => `${err.field}: ${err.message}`)
      .join("\n");

    toast.error(finalMessage, {
      description: fieldDetails,
    });
  } else {
    toast.error(finalMessage);
  }
}
