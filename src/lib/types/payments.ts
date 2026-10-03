export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface InitiatePaymentInput {
  invoiceId: string;
}

export interface InitiatePaymentResponse {
  paymentUrl: string;
  paymentId: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  gateway: string;
  transactionId?: string | null;
  amount: number;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  invoice?: {
    id: string;
    laborCost: number;
    partsCost: number;
    totalAmount: number;
    serviceRequestId: string;
  } | null;
}
