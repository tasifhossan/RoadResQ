import { getCurrentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const displayName = user?.name || "Admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="System-wide statistics and management overview."
      />
    </div>
  );
}
