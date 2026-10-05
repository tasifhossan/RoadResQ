import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { EarningsSummary } from "@/lib/types/mechanics";
import { getEarningsSummaryServer } from "@/lib/api/endpoints/mechanics.server";
import { getErrorMessage } from "@/lib/errors";
import { EarningsClient } from "./earnings-client";

export default async function MechanicEarningsPage() {
  // 1. Enforce authentication & MECHANIC role scoping
  await requireRole("MECHANIC");

  // 2. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: EarningsSummary | null = null;
  let initialError: string | null = null;

  // 3. Server fetch initial data
  if (token) {
    try {
      initialData = await getEarningsSummaryServer(token);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 4. Pass initialData to client component
  return (
    <EarningsClient
      initialData={initialData}
      initialError={initialError}
    />
  );
}
