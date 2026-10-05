import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { DashboardStats } from "@/lib/types/admin";
import { getDashboardStatsServer } from "@/lib/api/endpoints/admin.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminDashboardClient } from "./admin-dashboard-client";

export default async function AdminDashboardPage() {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Retrieve session user for header greeting
  const user = await getCurrentUser();
  const displayName = user?.name || "Admin";

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: DashboardStats | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getDashboardStatsServer(token);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AdminDashboardClient
      initialData={initialData}
      initialError={initialError}
      displayName={displayName}
    />
  );
}
