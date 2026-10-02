import { z } from "zod";
import { REQUEST_PRIORITIES } from "@/lib/api/types";

export const createServiceRequestSchema = z
  .object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    lat: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    lng: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    vehicleId: z.string().optional(),
    priority: z.enum(REQUEST_PRIORITIES).optional().default("NORMAL"),
  })
  .strict();

export type CreateServiceRequestSchema = z.infer<typeof createServiceRequestSchema>;

// Per-step schemas for wizard step validation
export const step1VehicleSchema = z.object({
  vehicleId: z.string().optional(),
});
export type Step1VehicleSchema = z.infer<typeof step1VehicleSchema>;

export const step2LocationSchema = z.object({
  lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});
export type Step2LocationSchema = z.infer<typeof step2LocationSchema>;

export const step3ProblemSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(REQUEST_PRIORITIES),
});
export type Step3ProblemSchema = z.infer<typeof step3ProblemSchema>;
