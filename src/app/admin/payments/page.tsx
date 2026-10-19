import { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { Paginated, PaymentStatus } from "@/lib/api/types";
import { AdminPaymentItem, GetPaymentsQueryInput } from "@/lib/types/admin";
import { getPaymentsQuerySchema } from "@/lib/validations/admin";
import { getPaymentsServer } from "@/lib/api/endpoints/admin.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminPaymentsClient } from "./admin-payments-client";

export const metadata: Metadata = {
  title: "Payments | Admin | RoadResQ",
  description: "Platform-wide payment transactions and invoices for RoadResQ administrators.",
};

interface AdminPaymentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Read and parse searchParams using Zod schema
  const resolvedParams = await searchParams;

  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
    status:
      typeof resolvedParams.status === "string"
        ? (resolvedParams.status as PaymentStatus)
        : undefined,
    from: typeof resolvedParams.from === "string" ? resolvedParams.from : undefined,
    to: typeof resolvedParams.to === "string" ? resolvedParams.to : undefined,
    sortBy:
      resolvedParams.sortBy === "createdAt" || resolvedParams.sortBy === "amount"
        ? (resolvedParams.sortBy as "createdAt" | "amount")
        : undefined,
    sortOrder:
      resolvedParams.sortOrder === "asc" || resolvedParams.sortOrder === "desc"
        ? (resolvedParams.sortOrder as "asc" | "desc")
        : undefined,
  };

  const parsedQuery = getPaymentsQuerySchema.safeParse(rawQuery);
  const queryParams: GetPaymentsQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialData: Paginated<AdminPaymentItem> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      initialData = await getPaymentsServer(token, queryParams);
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return (
    <AdminPaymentsClient
      initialData={initialData}
      initialError={initialError}
      queryParams={queryParams}
    />
  );
}
