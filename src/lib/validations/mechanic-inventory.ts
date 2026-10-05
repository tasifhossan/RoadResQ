import { z } from "zod";

/**
 * Low stock threshold constant mirrored from backend service:
 * backend/src/modules/mechanic-inventory/mechanic-inventory.service.ts (LOW_STOCK_THRESHOLD = 5)
 */
export const LOW_STOCK_THRESHOLD = 5;

export const booleanQuerySchema = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z.boolean().optional());

export const addInventoryItemSchema = z
  .object({
    sparePartId: z.string().min(1, "Spare part selection is required").optional(),
    name: z.string().min(1, "Name is required").optional(),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    stock: z
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock must be greater than or equal to 0"),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasSparePartId = Boolean(data.sparePartId);
    const hasName = Boolean(data.name);

    if (!hasSparePartId && !hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either catalog part or custom part name must be provided",
        path: ["sparePartId"],
      });
    }

    if (hasSparePartId && hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either catalog part or custom part name, not both",
        path: ["sparePartId"],
      });
    }
  });

export type AddInventoryItemInputSchema = z.infer<typeof addInventoryItemSchema>;

export const updateInventoryItemSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    price: z.number().min(0, "Price must be greater than or equal to 0").optional(),
    stock: z.number().int("Stock must be an integer").min(0, "Stock must be greater than or equal to 0").optional(),
  })
  .strict();

export type UpdateInventoryItemInputSchema = z.infer<typeof updateInventoryItemSchema>;

export const restockInventoryItemSchema = z
  .object({
    quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  })
  .strict();

export type RestockInventoryItemInputSchema = z.infer<typeof restockInventoryItemSchema>;

export const getInventoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    search: z.string().optional(),
    lowStock: booleanQuerySchema,
  })
  .strict();

export type GetInventoryQueryInputSchema = z.infer<typeof getInventoryQuerySchema>;
