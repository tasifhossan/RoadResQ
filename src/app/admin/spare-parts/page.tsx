import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { GetSparePartsQueryInput, SparePart } from "@/lib/types/spare-parts";
import { getSparePartsQuerySchema } from "@/lib/validations/spare-parts";
import { getSparePartsServer } from "@/lib/api/endpoints/spare-parts.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminSparePartsClient } from "./admin-spare-parts-client";

interface AdminSparePartsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSparePartsPage({ searchParams }: AdminSparePartsPageProps) {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
  };

  const parsedQuery = getSparePartsQuerySchema.safeParse(rawQuery);
  const queryParams: GetSparePartsQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<SparePart> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getSparePartsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AdminSparePartsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
