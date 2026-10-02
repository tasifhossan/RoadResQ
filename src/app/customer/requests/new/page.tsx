import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";
import { getMyVehiclesServer } from "@/lib/api/endpoints/vehicles.server";
import { RequestWizardClient } from "./request-wizard-client";

export default async function NewServiceRequestPage() {
  // 1. Require CUSTOMER authentication
  await requireRole("CUSTOMER");

  // 2. Fetch customer's registered vehicles for pre-selection in Step 1
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialVehicles: Paginated<Vehicle> | null = null;

  if (token) {
    try {
      initialVehicles = await getMyVehiclesServer(token, { page: 1, limit: 50 });
    } catch {
      // Graceful fallback if vehicle fetch fails
    }
  }

  return <RequestWizardClient initialVehicles={initialVehicles} />;
}
