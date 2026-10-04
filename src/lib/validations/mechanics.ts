import { z } from "zod";
import { AVAILABILITIES } from "@/lib/api/types";

export const updateAvailabilitySchema = z
  .object({
    availability: z.enum(AVAILABILITIES),
  })
  .strict();

export type UpdateAvailabilityInputSchema = z.infer<typeof updateAvailabilitySchema>;

export const updateLocationSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
  })
  .strict();

export type UpdateLocationInputSchema = z.infer<typeof updateLocationSchema>;

export const getEarningsQuerySchema = z.object({}).strict();
