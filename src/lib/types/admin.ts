import { Role } from "@/lib/api/types";

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
