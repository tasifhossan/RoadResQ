import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { getCurrentUser, requireRole } from "@/lib/auth/session";
import { Paginated, Role } from "@/lib/api/types";
import { AdminUserItem, GetUsersQueryInput } from "@/lib/types/admin";
import { getUsersQuerySchema } from "@/lib/validations/admin";
import { getAllUsersServer } from "@/lib/api/endpoints/admin.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminUsersClient } from "./admin-users-client";

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Get current authenticated admin payload
  const user = await getCurrentUser();

  // 3. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
    isActive:
      resolvedParams.isActive === "true"
        ? true
        : resolvedParams.isActive === "false"
        ? false
        : undefined,
    role: typeof resolvedParams.role === "string" ? (resolvedParams.role as Role) : undefined,
    sortBy: typeof resolvedParams.sortBy === "string" ? resolvedParams.sortBy : undefined,
    sortOrder: typeof resolvedParams.sortOrder === "string" ? resolvedParams.sortOrder : undefined,
  };

  const parsedQuery = getUsersQuerySchema.safeParse(rawQuery);
  const queryParams: GetUsersQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 4. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<AdminUserItem> | null = null;
  let initialError: string | null = null;

  // 5. Server fetch initial data
  if (token) {
    try {
      initialData = await getAllUsersServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AdminUsersClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
      currentUserId={user?.id}
    />
  );
}
