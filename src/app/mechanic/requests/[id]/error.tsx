"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicRequestDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Job detail error"
        description={error.message || "Unable to load job details."}
        onRetry={reset}
      />
    </div>
  );
}
