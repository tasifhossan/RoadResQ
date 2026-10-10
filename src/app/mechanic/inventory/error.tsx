"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicInventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load inventory"
        description={error.message || "An error occurred while loading inventory."}
        onRetry={reset}
      />
    </div>
  );
}
