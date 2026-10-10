"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AdminSparePartsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load spare parts catalog"
        description={error.message || "An error occurred while loading spare parts catalog."}
        onRetry={reset}
      />
    </div>
  );
}
