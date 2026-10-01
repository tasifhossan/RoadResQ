"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <ErrorState
        title="Application error"
        description={error.message || "An unexpected error occurred in RoadResQ application."}
        onRetry={reset}
      />
    </div>
  );
}
