import "server-only";
import { serverFetch } from "@/lib/api/server";
import { UserProfile } from "@/lib/auth/session";

interface BackendGoogleAuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export async function googleSignInServer(
  idToken: string
): Promise<BackendGoogleAuthResponse> {
  return serverFetch<BackendGoogleAuthResponse>("/auth/google", {
    method: "POST",
    body: { idToken },
  });
}
