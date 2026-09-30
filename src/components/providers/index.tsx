"use client";

import { QueryProvider } from "./query-provider";
import { SessionProvider, SessionUser } from "./session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export interface ProvidersProps {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}

export function Providers({ children, initialUser = null }: ProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider initialUser={initialUser}>
        <TooltipProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

export { QueryProvider } from "./query-provider";
export { SessionProvider, useSession } from "./session-provider";
export type { SessionUser } from "./session-provider";
