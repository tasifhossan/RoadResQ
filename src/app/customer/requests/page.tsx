import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { ServiceRequest } from "@/lib/types/service-requests";
import { serviceRequestListQuerySchema } from "@/lib/validations/service-requests";
import { getMyServiceRequestsServer } from "@/lib/api/endpoints/service-requests.server";
import { getErrorMessage } from "@/lib/errors";
import { CustomerRequestsClient } from "./requests-client";

interface CustomerRequestsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerRequestsPage({
  searchParams,
}: CustomerRequestsPageProps) {
  // 1. Enforce authentication & role scoping
  await requireRole("CUSTOMER");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    status: typeof resolvedParams.status === "string" ? resolvedParams.status : undefined,
    sortBy: typeof resolvedParams.sortBy === "string" ? resolvedParams.sortBy : undefined,
    sortOrder: typeof resolvedParams.sortOrder === "string" ? resolvedParams.sortOrder : undefined,
  };

  const parsedQuery = serviceRequestListQuerySchema.safeParse(rawQuery);
  const queryParams = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10, status: undefined, sortBy: "createdAt" as const, sortOrder: "desc" as const };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<ServiceRequest> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getMyServiceRequestsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 5. Pass initialData and queryParams to client component
  return (
    <CustomerRequestsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
