import { apiFetch } from "@/lib/api/client";
import { InitiatePaymentResponse, Payment } from "@/lib/types/payments";

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
