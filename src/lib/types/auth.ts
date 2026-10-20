import { UserProfile } from "@/lib/auth/session";

export interface GoogleAuthResponse {
  user: UserProfile;
}

export interface GoogleAuthPayload {
  idToken: string;
}
