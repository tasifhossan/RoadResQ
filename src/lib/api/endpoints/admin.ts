import { apiFetch } from "@/lib/api/client";
import { DashboardStats } from "@/lib/types/admin";

export async function getDashboardStatsApi(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("admin/dashboard-stats");
}
