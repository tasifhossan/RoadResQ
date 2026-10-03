import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Payment } from "@/lib/types/payments";

export async function getPaymentStatusServer(
  token: string,
  id: string
): Promise<{ payment: Payment }> {
  return serverFetch<{ payment: Payment }>(`payments/${id}`, {
    token,
  });
}
