import { z } from "zod";

export const createReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .max(500, "Comment cannot exceed 500 characters")
      .optional(),
  })
  .strict();

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export const getMechanicReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type GetMechanicReviewsQuerySchema = z.infer<typeof getMechanicReviewsQuerySchema>;
