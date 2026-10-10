"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicEarningsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load earnings"
        description={error.message || "An error occurred while loading earnings summary."}
        onRetry={reset}
      />
    </div>
  );
}
