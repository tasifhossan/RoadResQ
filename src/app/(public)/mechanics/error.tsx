"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ErrorState
        title="Unable to display mechanics"
        description={
          error.message || "An unexpected error occurred while loading mechanics. Please try again."
        }
        onRetry={reset}
      />
    </div>
  );
}
