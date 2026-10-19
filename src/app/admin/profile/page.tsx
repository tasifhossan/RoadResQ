import { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole, UserProfile } from "@/lib/auth/session";
import { getMeServer } from "@/lib/api/endpoints/users.server";
import { getErrorMessage } from "@/lib/errors";
import { AdminProfileClient } from "./admin-profile-client";

export const metadata: Metadata = {
  title: "Admin Profile | RoadResQ",
  description: "Administrator profile settings and account information.",
};

export default async function AdminProfilePage() {
  // 1. Enforce authentication & ADMIN role scoping
  await requireRole("ADMIN");

  // 2. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialUser: UserProfile | null = null;
  let initialError: string | null = null;

  // 3. Server fetch current authenticated user profile
  if (token) {
    try {
      const res = await getMeServer(token);
      initialUser = res.user;
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return <AdminProfileClient initialUser={initialUser} initialError={initialError} />;
}
