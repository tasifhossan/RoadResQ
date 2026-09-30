"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/types";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Retry disabled for 4xx ApiErrors (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found)
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              // Max 2 retries otherwise
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
