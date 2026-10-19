import { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated, RequestPriority, RequestStatus } from "@/lib/api/types";
import { AdminServiceRequestItem, GetServiceRequestsQueryInput } from "@/lib/types/admin";
import { getServiceRequestsQuerySchema } from "@/lib/validations/admin";
import { getServiceRequestsServer } from "@/lib/api/endpoints/admin.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminRequestsClient } from "./admin-requests-client";

export const metadata: Metadata = {
  title: "Service Requests | Admin | RoadResQ",
  description: "Platform-wide service request management for RoadResQ administrators.",
};

interface AdminRequestsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    status:
      typeof resolvedParams.status === "string"
        ? (resolvedParams.status as RequestStatus)
        : undefined,
    priority:
      typeof resolvedParams.priority === "string"
        ? (resolvedParams.priority as RequestPriority)
        : undefined,
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
    from: typeof resolvedParams.from === "string" ? resolvedParams.from : undefined,
    to: typeof resolvedParams.to === "string" ? resolvedParams.to : undefined,
    sortBy:
      resolvedParams.sortBy === "createdAt" || resolvedParams.sortBy === "updatedAt"
        ? resolvedParams.sortBy
        : undefined,
    sortOrder:
      resolvedParams.sortOrder === "asc" || resolvedParams.sortOrder === "desc"
        ? resolvedParams.sortOrder
        : undefined,
  };

  const parsedQuery = getServiceRequestsQuerySchema.safeParse(rawQuery);
  const queryParams: GetServiceRequestsQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<AdminServiceRequestItem> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getServiceRequestsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AdminRequestsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
