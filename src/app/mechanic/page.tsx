import { getCurrentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";

export default async function MechanicDashboardPage() {
  const user = await getCurrentUser();
  const displayName = user?.name || "Mechanic";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Overview of assigned requests, job status, and location updates."
      />
    </div>
  );
}
