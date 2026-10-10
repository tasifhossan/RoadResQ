"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicRequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load assigned jobs"
        description={error.message || "An error occurred while loading your assigned jobs."}
        onRetry={reset}
      />
    </div>
  );
}
