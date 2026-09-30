// Enums copied from Prisma schema
export const ROLES = ["CUSTOMER", "MECHANIC", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const AVAILABILITIES = ["AVAILABLE", "BUSY", "OFFLINE"] as const;
export type Availability = (typeof AVAILABILITIES)[number];
export type MechanicAvailability = Availability;

export const REQUEST_STATUSES = [
  "PENDING",
  "SEARCHING",
  "ASSIGNED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_PRIORITIES = ["LOW", "NORMAL", "HIGH", "EMERGENCY"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const INVOICE_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Formatted Error shape from backend formatZodError
export interface FormattedError {
  field: string;
  message: string;
}

// Response envelope shape from backend sendResponse
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FormattedError[];
}

// Standardized Pagination metadata and paginated response shape
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

// Custom API Error class
export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: FormattedError[];

  constructor(status: number, message: string, errors?: FormattedError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;

    // Restore prototype chain for ES5 / TS inheritance
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
