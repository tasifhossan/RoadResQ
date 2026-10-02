import { z } from "zod";
import { REQUEST_PRIORITIES, REQUEST_STATUSES } from "@/lib/api/types";

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

export const nearbyMechanicsQuerySchema = z
  .object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radiusKm: z.coerce.number().optional().default(10),
  })
  .strict();

export type NearbyMechanicsQuerySchema = z.infer<typeof nearbyMechanicsQuerySchema>;

export const assignMechanicSchema = z
  .object({
    mechanicId: z.string().min(1, "Mechanic ID is required"),
  })
  .strict();

export type AssignMechanicSchema = z.infer<typeof assignMechanicSchema>;

export const createReviewSchema = z
  .object({
    rating: z
      .number({ message: "Rating is required" })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
  })
  .strict();

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export const serviceRequestListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    status: z.enum(REQUEST_STATUSES).optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strict();

export type ServiceRequestListQuerySchema = z.infer<typeof serviceRequestListQuerySchema>;

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
