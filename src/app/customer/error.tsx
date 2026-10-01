"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Dashboard error"
        description={error.message || "An unexpected error occurred while loading customer portal."}
        onRetry={reset}
      />
    </div>
  );
}
