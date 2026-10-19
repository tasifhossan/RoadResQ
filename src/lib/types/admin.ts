import { PaymentStatus, RequestPriority, RequestStatus, Role } from "@/lib/api/types";

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    mechanics: number;
    admins: number;
  };
  serviceRequests: {
    total: number;
    byStatus: Record<string, number>;
    completedJobs: number;
  };
  revenue: {
    totalPaidAmount: string;
  };
  requestsOverTime: Array<{
    date: string;
    count: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    amount: string;
  }>;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mechanicProfile?: {
    id: string;
    userId: string;
    skills: string[];
    currentLat: number | null;
    currentLng: number | null;
    availability: string;
    rating: number;
    totalJobs: number;
  } | null;
}

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface GetUsersQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: Role;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

export interface UpdateUserRoleInput {
  role: Role;
}

export interface GetAuditLogsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  from?: string;
  to?: string;
}

export interface AdminServiceRequestItem {
  id: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
  mechanic: {
    id: string;
    name: string;
  } | null;
  vehicle: {
    make: string;
    model: string;
    plateNumber: string;
  } | null;
}

export interface GetServiceRequestsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminPaymentItem {
  id: string;
  amount: number | string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  invoice: {
    id: string;
    total: number | string;
  };
  serviceRequest: {
    id: string;
  };
  customer: {
    name: string;
  };
}

export interface GetPaymentsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  from?: string;
  to?: string;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

