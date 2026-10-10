"use client";

import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/keys";
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
  isLoading: boolean;
  setUser: (user: SessionUser | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export interface SessionProviderProps {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}

export function useSessionQuery(enabled = true) {
  return useQuery<{ user: SessionUser | null }>({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return { user: null };
      return res.json();
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function SessionProvider({ children, initialUser = null }: SessionProviderProps) {
  const isServerProvided = initialUser !== null;
  const { data, isLoading } = useSessionQuery(!isServerProvided);
  const [clientUser, setClientUser] = useState<SessionUser | null>(initialUser);

  const activeUser = isServerProvided
    ? (clientUser ?? initialUser)
    : (clientUser ?? data?.user ?? null);

  const value: SessionContextValue = {
    user: activeUser,
    role: activeUser?.role ?? null,
    isAuthenticated: !!activeUser,
    isLoading: !isServerProvided && isLoading,
    setUser: setClientUser,
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
