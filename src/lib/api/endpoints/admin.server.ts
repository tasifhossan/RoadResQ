import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import {
  AdminUserItem,
  AuditLogItem,
  DashboardStats,
  GetAuditLogsQueryInput,
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
