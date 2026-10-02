import { UserProfile } from "@/lib/auth/session";

export type User = UserProfile;

export interface UpdateUserInput {
  name?: string;
  phone?: string;
}
