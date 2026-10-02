import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
  })
  .strict();

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
