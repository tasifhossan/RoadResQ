"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function CustomerPaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load payments"
        description={error.message || "An error occurred while loading your payment history."}
        onRetry={reset}
      />
    </div>
  );
}
