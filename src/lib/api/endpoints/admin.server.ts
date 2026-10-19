import "server-only";
import { serverFetch } from "@/lib/api/server";
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
} from "@/lib/types/admin";

export async function getDashboardStatsServer(token: string): Promise<DashboardStats> {
  return serverFetch<DashboardStats>("admin/dashboard-stats", {
    token,
  });
}

export async function getAllUsersServer(
  token: string,
  query?: GetUsersQueryInput
): Promise<Paginated<AdminUserItem>> {
  return serverFetch<Paginated<AdminUserItem>>("admin/users", {
    token,
    query,
  });
}

export async function getAuditLogsServer(
  token: string,
  query?: GetAuditLogsQueryInput
): Promise<Paginated<AuditLogItem>> {
  return serverFetch<Paginated<AuditLogItem>>("admin/audit-logs", {
    token,
    query,
  });
}

export async function getServiceRequestsServer(
  token: string,
  query?: GetServiceRequestsQueryInput
): Promise<Paginated<AdminServiceRequestItem>> {
  return serverFetch<Paginated<AdminServiceRequestItem>>("admin/service-requests", {
    token,
    query,
  });
}

export async function getPaymentsServer(
  token: string,
  query?: GetPaymentsQueryInput
): Promise<Paginated<AdminPaymentItem>> {
  return serverFetch<Paginated<AdminPaymentItem>>("admin/payments", {
    token,
    query,
  });
}

