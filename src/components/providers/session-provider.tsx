"use client";

import { createContext, useContext, useState } from "react";
import { Role } from "@/lib/api/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

interface SessionContextValue {
  user: SessionUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  setUser: (user: SessionUser | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export interface SessionProviderProps {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}

export function SessionProvider({ children, initialUser = null }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  const value: SessionContextValue = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    setUser,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
