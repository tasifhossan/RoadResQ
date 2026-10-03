import { z } from "zod";

export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;

export const initiatePaymentSchema = z
  .object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
  })
  .strict();

export type InitiatePaymentSchema = z.infer<typeof initiatePaymentSchema>;

export const getMyPaymentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    status: z.enum(PAYMENT_STATUSES).optional(),
  })
  .strict();

export type GetMyPaymentsQuerySchema = z.infer<typeof getMyPaymentsQuerySchema>;
