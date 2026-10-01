import { Role } from "@/lib/api/types";

export interface DecodedJwtPayload {
  id: string;
  role: Role;
  email: string;
  exp: number; // Expiration timestamp in seconds
  iat?: number;
}

/**
 * Decodes a JWT payload string without verifying signature.
 * Verification is performed server-side by the backend.
 * Returns null if the token is malformed.
 */
export function decodeJwt(token: string): DecodedJwtPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const decoded = JSON.parse(jsonPayload) as Partial<DecodedJwtPayload>;

    if (
      !decoded ||
      typeof decoded.id !== "string" ||
      typeof decoded.role !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.exp !== "number"
    ) {
      return null;
    }

    return {
      id: decoded.id,
      role: decoded.role as Role,
      email: decoded.email,
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch {
    return null;
  }
}
