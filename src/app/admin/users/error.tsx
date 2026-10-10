"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AdminUsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load users"
        description={error.message || "An error occurred while loading user management data."}
        onRetry={reset}
      />
    </div>
  );
}
