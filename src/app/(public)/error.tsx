"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <ErrorState
        title="Page error"
        description={error.message || "An unexpected error occurred while rendering this page."}
        onRetry={reset}
      />
    </div>
  );
}
