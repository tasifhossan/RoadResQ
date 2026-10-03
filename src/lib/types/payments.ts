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

export interface GetMyPaymentsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export interface MyPaymentInvoice {
  id: string;
  laborCost: number;
  partsCost: number;
  total: number;
}

export interface MyPaymentServiceRequest {
  id: string;
  status: string;
  vehicle: {
    make: string;
    model: string;
    plateNumber: string;
  } | null;
}

export interface MyPaymentItem {
  id: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  invoice: MyPaymentInvoice;
  serviceRequest: MyPaymentServiceRequest | null;
}
