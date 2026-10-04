import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { getAssignedServiceRequestsServer } from "@/lib/api/endpoints/service-requests.server";
import { getEarningsSummaryServer } from "@/lib/api/endpoints/mechanics.server";
import { Paginated } from "@/lib/api/types";
import { ServiceRequest } from "@/lib/types/service-requests";
import { EarningsSummary } from "@/lib/types/mechanics";
import { MechanicDashboardClient } from "./mechanic-dashboard-client";

export default async function MechanicDashboardPage() {
  await requireRole("MECHANIC");

  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialAssignedRequests: Paginated<ServiceRequest> | null = null;
  let initialEarnings: EarningsSummary | null = null;

  if (token) {
    try {
      const [assignedRes, earningsRes] = await Promise.allSettled([
        getAssignedServiceRequestsServer(token, { page: 1, limit: 10 }),
        getEarningsSummaryServer(token),
      ]);

      if (assignedRes.status === "fulfilled") {
        initialAssignedRequests = assignedRes.value;
      }
      if (earningsRes.status === "fulfilled") {
        initialEarnings = earningsRes.value;
      }
    } catch {
      // Fallback gracefully on server error
    }
  }

  return (
    <MechanicDashboardClient
      initialUser={user}
      initialAssignedRequests={initialAssignedRequests}
      initialEarnings={initialEarnings}
    />
  );
}
