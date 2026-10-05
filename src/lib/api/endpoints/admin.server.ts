import "server-only";
import { serverFetch } from "@/lib/api/server";
import { DashboardStats } from "@/lib/types/admin";

export async function getDashboardStatsServer(token: string): Promise<DashboardStats> {
  return serverFetch<DashboardStats>("admin/dashboard-stats", {
    token,
  });
}
