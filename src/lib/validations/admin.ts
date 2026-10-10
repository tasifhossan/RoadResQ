import { z } from "zod";
import { ROLES } from "@/lib/api/types";

export const updateUserRoleSchema = z
  .object({
    role: z.enum(ROLES, {
      message: "Role must be CUSTOMER, MECHANIC, or ADMIN",
    }),
  })
  .strict();

export const getUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    search: z.string().optional(),
    isActive: z
      .preprocess((val) => {
        if (typeof val === "string") {
          if (val === "true") return true;
          if (val === "false") return false;
        }
        return val;
      }, z.boolean().optional()),
    role: z.enum(ROLES).optional(),
    sortBy: z.enum(["createdAt", "name"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strict();

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/lib/constants/filter-options";

export const getAuditLogsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    entityType: z.enum(AUDIT_ENTITY_TYPES).optional(),
    action: z.enum(AUDIT_ACTIONS).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .strict();

export type GetAuditLogsQueryInput = z.infer<typeof getAuditLogsQuerySchema>;

export const AdminValidation = {
  updateUserRoleSchema,
  getUsersQuerySchema,
  getAuditLogsQuerySchema,
};
