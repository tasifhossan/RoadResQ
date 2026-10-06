import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { AuditLogItem, GetAuditLogsQueryInput } from "@/lib/types/admin";
import { getAuditLogsQuerySchema } from "@/lib/validations/admin";
import { getAuditLogsServer } from "@/lib/api/endpoints/admin.server";
import { getErrorMessage } from "@/lib/errors";
import { AuditLogsClient } from "./audit-logs-client";

interface AdminAuditLogsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminAuditLogsPage({ searchParams }: AdminAuditLogsPageProps) {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    entityType: typeof resolvedParams.entityType === "string" ? resolvedParams.entityType : undefined,
    action: typeof resolvedParams.action === "string" ? resolvedParams.action : undefined,
    from: typeof resolvedParams.from === "string" ? resolvedParams.from : undefined,
    to: typeof resolvedParams.to === "string" ? resolvedParams.to : undefined,
  };

  const parsedQuery = getAuditLogsQuerySchema.safeParse(rawQuery);
  const queryParams: GetAuditLogsQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<AuditLogItem> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getAuditLogsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AuditLogsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
