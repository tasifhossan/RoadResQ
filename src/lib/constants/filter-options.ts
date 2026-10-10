import { FilterOption } from "@/components/shared/filter-select";
import {
  RequestStatus,
  REQUEST_STATUSES,
  PaymentStatus,
  PAYMENT_STATUSES,
  Role,
  ROLES,
} from "@/lib/api/types";

// Friendly labels typed against RequestStatus enum so invalid keys fail tsc
const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  SEARCHING: "Searching",
  ASSIGNED: "Assigned",
  EN_ROUTE: "En Route",
  ARRIVED: "Arrived",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const REQUEST_STATUS_FILTER_OPTIONS: FilterOption[] = REQUEST_STATUSES.map((status) => ({
  label: REQUEST_STATUS_LABELS[status],
  value: status,
}));

// Friendly labels typed against PaymentStatus enum so invalid keys fail tsc
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_FILTER_OPTIONS: FilterOption[] = PAYMENT_STATUSES.map((status) => ({
  label: PAYMENT_STATUS_LABELS[status],
  value: status,
}));

// Friendly labels typed against Role enum so invalid keys fail tsc
const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  MECHANIC: "Mechanic",
  ADMIN: "Admin",
};

export const ROLE_FILTER_OPTIONS: FilterOption[] = ROLES.map((role) => ({
  label: ROLE_LABELS[role],
  value: role,
}));

// User active status filter options
export const USER_ACTIVE_FILTER_OPTIONS: FilterOption[] = [
  { label: "Active", value: "true" },
  { label: "Deactivated", value: "false" },
];

// Service request & job list sort options
export const REQUEST_SORT_BY_OPTIONS: FilterOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Updated Date", value: "updatedAt" },
];

export const REQUEST_SORT_ORDER_OPTIONS: FilterOption[] = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

// User list sort options
export const USER_SORT_BY_OPTIONS: FilterOption[] = [
  { label: "Date Created", value: "createdAt" },
  { label: "Name", value: "name" },
];

export const USER_SORT_ORDER_OPTIONS: FilterOption[] = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

/**
 * Audit Log Entity Types
 * Derived from backend AuditLog creation sites:
 * - 'ServiceRequest': ../backend/src/modules/service-requests/service-request.service.ts (L366, L827)
 * - 'MechanicInventory': ../backend/src/modules/mechanic-inventory/mechanic-inventory.service.ts (L256)
 * - 'User': ../backend/src/modules/admin/admin.service.ts (L156, L243, L293)
 * - 'System': ../backend/prisma/seed.ts (L453)
 */
export const AUDIT_ENTITY_TYPES = [
  "ServiceRequest",
  "MechanicInventory",
  "User",
  "System",
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

const AUDIT_ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  ServiceRequest: "Service Request",
  MechanicInventory: "Mechanic Inventory",
  User: "User",
  System: "System",
};

export const AUDIT_ENTITY_TYPE_FILTER_OPTIONS: FilterOption[] = AUDIT_ENTITY_TYPES.map(
  (entityType) => ({
    label: AUDIT_ENTITY_TYPE_LABELS[entityType],
    value: entityType,
  })
);

/**
 * Audit Log Actions
 * Derived from backend AuditLog creation sites:
 * - 'STATUS_CHANGE': ../backend/src/modules/service-requests/service-request.service.ts (L365, L826)
 * - 'RESTOCK': ../backend/src/modules/mechanic-inventory/mechanic-inventory.service.ts (L255)
 * - 'UPDATE_USER_ROLE': ../backend/src/modules/admin/admin.service.ts (L155)
 * - 'DEACTIVATE_USER': ../backend/src/modules/admin/admin.service.ts (L242)
 * - 'REACTIVATE_USER': ../backend/src/modules/admin/admin.service.ts (L292)
 * - 'DATABASE_SEED': ../backend/prisma/seed.ts (L452)
 */
export const AUDIT_ACTIONS = [
  "STATUS_CHANGE",
  "RESTOCK",
  "UPDATE_USER_ROLE",
  "DEACTIVATE_USER",
  "REACTIVATE_USER",
  "DATABASE_SEED",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  STATUS_CHANGE: "Status Change",
  RESTOCK: "Inventory Restock",
  UPDATE_USER_ROLE: "Update User Role",
  DEACTIVATE_USER: "Deactivate User",
  REACTIVATE_USER: "Reactivate User",
  DATABASE_SEED: "Database Seed",
};

export const AUDIT_ACTION_FILTER_OPTIONS: FilterOption[] = AUDIT_ACTIONS.map((action) => ({
  label: AUDIT_ACTION_LABELS[action],
  value: action,
}));
