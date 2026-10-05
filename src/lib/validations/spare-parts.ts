import { z } from "zod";

export const getSparePartsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().optional(),
});

export type GetSparePartsQueryInputSchema = z.infer<typeof getSparePartsQuerySchema>;
