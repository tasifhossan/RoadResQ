import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  GetMyPaymentsQueryInput,
  InitiatePaymentResponse,
  MyPaymentItem,
  Payment,
} from "@/lib/types/payments";

export async function initiatePaymentApi(
  invoiceId: string
): Promise<InitiatePaymentResponse> {
  return apiFetch<InitiatePaymentResponse>("payments/initiate", {
    method: "POST",
    body: { invoiceId },
  });
}

export async function getPaymentStatusApi(
  id: string
): Promise<{ payment: Payment }> {
  return apiFetch<{ payment: Payment }>(`payments/${id}`);
}

export async function getMyPaymentsApi(
  query?: GetMyPaymentsQueryInput
): Promise<Paginated<MyPaymentItem>> {
  return apiFetch<Paginated<MyPaymentItem>>("payments/my", { query });
}
