import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";
import { getMyVehiclesQuerySchema } from "@/lib/validations/vehicles";
import { getMyVehiclesServer } from "@/lib/api/endpoints/vehicles.server";
import { getErrorMessage } from "@/lib/errors";
import { VehiclesClient } from "./vehicles-client";

interface CustomerVehiclesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerVehiclesPage({
  searchParams,
}: CustomerVehiclesPageProps) {
  // 1. Enforce authentication & role scoping
  await requireRole("CUSTOMER");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
  };

  const parsedQuery = getMyVehiclesQuerySchema.safeParse(rawQuery);
  const queryParams = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 20, search: undefined };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<Vehicle> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getMyVehiclesServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 5. Pass initialData and queryParams to client component
  return (
    <VehiclesClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
