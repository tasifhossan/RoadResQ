import { apiFetch } from "@/lib/api/client";
import { UserProfile } from "@/lib/auth/session";
import { CustomerSummaryData, UpdateUserInput } from "@/lib/types/users";

export async function getMeApi(): Promise<{ user: UserProfile }> {
  return apiFetch<{ user: UserProfile }>("users/me");
}

export async function updateMeApi(
  data: UpdateUserInput
): Promise<{ user: UserProfile }> {
  return apiFetch<{ user: UserProfile }>("users/me", {
    method: "PATCH",
    body: data,
  });
}

export async function getMySummaryApi(): Promise<CustomerSummaryData> {
  return apiFetch<CustomerSummaryData>("users/me/summary");
}
