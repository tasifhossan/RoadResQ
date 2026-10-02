import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole, UserProfile } from "@/lib/auth/session";
import { getMeServer } from "@/lib/api/endpoints/users.server";
import { getErrorMessage } from "@/lib/errors";
import { ProfileClient } from "./profile-client";

export default async function CustomerProfilePage() {
  await requireRole("CUSTOMER");

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialUser: UserProfile | null = null;
  let initialError: string | null = null;

  if (token) {
    try {
      const res = await getMeServer(token);
      initialUser = res.user;
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  return <ProfileClient initialUser={initialUser} initialError={initialError} />;
}

