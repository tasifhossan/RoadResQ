import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole, UserProfile } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";
import { ServiceRequest } from "@/lib/types/service-requests";
import { getMeServer } from "@/lib/api/endpoints/users.server";
import { getMyVehiclesServer } from "@/lib/api/endpoints/vehicles.server";
import { getMyServiceRequestsServer } from "@/lib/api/endpoints/service-requests.server";
import { DashboardClient } from "./dashboard-client";

export default async function CustomerDashboardPage() {
  await requireRole("CUSTOMER");

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialUser: UserProfile | null = null;
  let initialVehicles: Paginated<Vehicle> | null = null;
  let initialRequests: Paginated<ServiceRequest> | null = null;

  if (token) {
    const results = await Promise.allSettled([
      getMeServer(token),
      getMyVehiclesServer(token, { limit: 1 }),
      getMyServiceRequestsServer(token, { limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
    ]);

    if (results[0].status === "fulfilled") {
      initialUser = results[0].value.user;
    }
    if (results[1].status === "fulfilled") {
      initialVehicles = results[1].value;
    }
    if (results[2].status === "fulfilled") {
      initialRequests = results[2].value;
    }
  }

  return (
    <DashboardClient
      initialUser={initialUser}
      initialVehicles={initialVehicles}
      initialRequests={initialRequests}
    />
  );
}

