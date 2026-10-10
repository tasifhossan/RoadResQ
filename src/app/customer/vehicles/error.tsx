"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function CustomerVehiclesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load vehicles"
        description={error.message || "An error occurred while retrieving your vehicles."}
        onRetry={reset}
      />
    </div>
  );
}
