import { z } from "zod";

export const createSparePartSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
  })
  .strict();

export type CreateSparePartInputSchema = z.infer<typeof createSparePartSchema>;

export const updateSparePartSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
  })
  .strict();

export type UpdateSparePartInputSchema = z.infer<typeof updateSparePartSchema>;

export const getSparePartsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().optional(),
});

export type GetSparePartsQueryInputSchema = z.infer<typeof getSparePartsQuerySchema>;

export const SparePartValidation = {
  createSparePartSchema,
  updateSparePartSchema,
  getSparePartsQuerySchema,
};
