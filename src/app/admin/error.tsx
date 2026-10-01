"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Admin portal error"
        description={error.message || "An unexpected error occurred while loading admin portal."}
        onRetry={reset}
      />
    </div>
  );
}
