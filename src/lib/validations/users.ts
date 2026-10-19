import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().optional(),
    bio: z.string().max(400, "Bio must be at most 400 characters").nullable().optional(),
    city: z.string().nullable().optional(),
    yearsExperience: z
      .number()
      .int("Years of experience must be an integer")
      .min(0, "Years of experience must be non-negative")
      .nullable()
      .optional(),
  })
  .strict();

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type UpdateUserInput = UpdateUserSchema;

export const getMySummaryQuerySchema = z.object({}).strict();
export type GetMySummaryQueryInput = z.infer<typeof getMySummaryQuerySchema>;
