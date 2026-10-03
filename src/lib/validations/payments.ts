import { z } from "zod";

export const initiatePaymentSchema = z
  .object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
  })
  .strict();

export type InitiatePaymentSchema = z.infer<typeof initiatePaymentSchema>;
