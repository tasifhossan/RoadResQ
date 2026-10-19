import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  AdminPaymentItem,
  AdminServiceRequestItem,
  AdminUserItem,
  AuditLogItem,
  DashboardStats,
  GetAuditLogsQueryInput,
  GetPaymentsQueryInput,
  GetServiceRequestsQueryInput,
  GetUsersQueryInput,
  UpdateUserRoleInput,
} from "@/lib/types/admin";

export async function getDashboardStatsApi(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("admin/dashboard-stats");
}

export async function getAllUsersApi(
  query?: GetUsersQueryInput
): Promise<Paginated<AdminUserItem>> {
  return apiFetch<Paginated<AdminUserItem>>("admin/users", { query });
}

export async function updateUserRoleApi(
  userId: string,
  data: UpdateUserRoleInput
): Promise<{ user: AdminUserItem }> {
  return apiFetch<{ user: AdminUserItem }>(`admin/users/${userId}/role`, {
    method: "PATCH",
    body: data,
  });
}

export async function deactivateUserApi(userId: string): Promise<{ user: AdminUserItem }> {
  return apiFetch<{ user: AdminUserItem }>(`admin/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}

export async function reactivateUserApi(userId: string): Promise<{ user: AdminUserItem }> {
  return apiFetch<{ user: AdminUserItem }>(`admin/users/${userId}/reactivate`, {
    method: "PATCH",
  });
}

export async function getAuditLogsApi(
  query?: GetAuditLogsQueryInput
): Promise<Paginated<AuditLogItem>> {
  return apiFetch<Paginated<AuditLogItem>>("admin/audit-logs", { query });
}

export async function getServiceRequestsApi(
  query?: GetServiceRequestsQueryInput
): Promise<Paginated<AdminServiceRequestItem>> {
  return apiFetch<Paginated<AdminServiceRequestItem>>("admin/service-requests", { query });
}

export async function getPaymentsApi(
  query?: GetPaymentsQueryInput
): Promise<Paginated<AdminPaymentItem>> {
  return apiFetch<Paginated<AdminPaymentItem>>("admin/payments", { query });
}

