import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { MyPaymentItem } from "@/lib/types/payments";
import { getMyPaymentsQuerySchema } from "@/lib/validations/payments";
import { getMyPaymentsServer } from "@/lib/api/endpoints/payments.server";
import { getErrorMessage } from "@/lib/errors";
import { CustomerPaymentsClient } from "./payments-client";

interface CustomerPaymentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerPaymentsPage({
  searchParams,
}: CustomerPaymentsPageProps) {
  // 1. Enforce authentication & CUSTOMER role
  await requireRole("CUSTOMER");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    status: typeof resolvedParams.status === "string" ? resolvedParams.status : undefined,
  };

  const parsedQuery = getMyPaymentsQuerySchema.safeParse(rawQuery);
  const queryParams = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10, status: undefined };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<MyPaymentItem> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getMyPaymentsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 5. Pass initialData and queryParams to client component
  return (
    <CustomerPaymentsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
