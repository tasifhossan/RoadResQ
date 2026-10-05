import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { GetInventoryQueryInput, MechanicInventoryItem } from "@/lib/types/mechanics";
import { getInventoryQuerySchema } from "@/lib/validations/mechanic-inventory";
import { getMechanicInventoryServer } from "@/lib/api/endpoints/mechanics.server";
import { getErrorMessage } from "@/lib/errors";
import { MechanicInventoryClient } from "./mechanic-inventory-client";

interface MechanicInventoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MechanicInventoryPage({
  searchParams,
}: MechanicInventoryPageProps) {
  // 1. Enforce authentication & MECHANIC role scoping
  await requireRole("MECHANIC");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
    lowStock:
      resolvedParams.lowStock === "true"
        ? true
        : resolvedParams.lowStock === "false"
        ? false
        : undefined,
  };

  const parsedQuery = getInventoryQuerySchema.safeParse(rawQuery);
  const queryParams: GetInventoryQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<MechanicInventoryItem> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getMechanicInventoryServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 5. Pass initialData and queryParams to client component
  return (
    <MechanicInventoryClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
