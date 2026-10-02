import "server-only";
import { serverFetch } from "@/lib/api/server";
import { UserProfile } from "@/lib/auth/session";

export async function getMeServer(token: string): Promise<{ user: UserProfile }> {
  return serverFetch<{ user: UserProfile }>("users/me", {
    token,
  });
}
