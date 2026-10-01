import { Role } from "@/lib/api/types";

export const COOKIE_ACCESS_TOKEN = "rrq_access";
export const COOKIE_REFRESH_TOKEN = "rrq_refresh";

export const ROLE_HOME_MAP: Record<Role, string> = {
  CUSTOMER: "/customer",
  MECHANIC: "/mechanic",
  ADMIN: "/admin",
};
