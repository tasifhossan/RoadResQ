"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function MechanicProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load mechanic profile"
        description={error.message || "An error occurred while loading your profile."}
        onRetry={reset}
      />
    </div>
  );
}
