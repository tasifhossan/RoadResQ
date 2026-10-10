"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RequestDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Service request error"
        description={error.message || "Unable to load service request details."}
        onRetry={reset}
      />
    </div>
  );
}
