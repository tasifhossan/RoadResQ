import { GoogleAuthResponse } from "@/lib/types/auth";
import { GoogleAuthInput } from "@/lib/validations/auth";

export async function googleSignInApi(
  data: GoogleAuthInput
): Promise<GoogleAuthResponse> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const error = new Error(json.message || "Google sign-in failed") as Error & {
      status?: number;
      errors?: unknown;
    };
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }

  return json.data as GoogleAuthResponse;
}
