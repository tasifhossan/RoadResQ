import "server-only";
import { serverFetch } from "@/lib/api/server";
import { UserProfile } from "@/lib/auth/session";
import { CustomerSummaryData } from "@/lib/types/users";

export async function getMeServer(token: string): Promise<{ user: UserProfile }> {
  return serverFetch<{ user: UserProfile }>("users/me", {
    token,
  });
}

export async function getMySummaryServer(token: string): Promise<CustomerSummaryData> {
  return serverFetch<CustomerSummaryData>("users/me/summary", {
    token,
  });
}
