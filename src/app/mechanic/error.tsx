"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Portal error"
        description={error.message || "An unexpected error occurred while loading mechanic portal."}
        onRetry={reset}
      />
    </div>
  );
}
