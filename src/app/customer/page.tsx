import { getCurrentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();
  const displayName = user?.name || "Customer";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Overview of active roadside requests and quick actions."
      />
    </div>
  );
}
