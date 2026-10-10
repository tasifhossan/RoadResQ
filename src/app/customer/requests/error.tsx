"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function CustomerRequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load requests"
        description={error.message || "An unexpected error occurred while loading your service requests."}
        onRetry={reset}
      />
    </div>
  );
}
