import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { GetMyPaymentsQueryInput, MyPaymentItem, Payment } from "@/lib/types/payments";

export async function getPaymentStatusServer(
  token: string,
  id: string
): Promise<{ payment: Payment }> {
  return serverFetch<{ payment: Payment }>(`payments/${id}`, {
    token,
  });
}

export async function getMyPaymentsServer(
  token: string,
  query?: GetMyPaymentsQueryInput
): Promise<Paginated<MyPaymentItem>> {
  return serverFetch<Paginated<MyPaymentItem>>("payments/my", {
    token,
    query,
  });
}
