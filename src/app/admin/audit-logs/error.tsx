"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AdminAuditLogsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load audit logs"
        description={error.message || "An error occurred while retrieving system audit logs."}
        onRetry={reset}
      />
    </div>
  );
}
