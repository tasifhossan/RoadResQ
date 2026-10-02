/**
 * TanStack Query key factory pattern.
 * Per-feature namespaces are kept clean and structured for upcoming feature modules.
 */
export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  users: {
    all: (filters?: Record<string, unknown>) => ["users", filters] as const,
    detail: (id: string) => ["users", id] as const,
  },
  vehicles: {
    all: () => ["vehicles"] as const,
    list: (filters?: Record<string, unknown>) => ["vehicles", "list", filters] as const,
    detail: (id: string) => ["vehicles", id] as const,
  },
  serviceRequests: {
    all: (filters?: Record<string, unknown>) => ["service-requests", filters] as const,
    my: (filters?: Record<string, unknown>) => ["service-requests", "my", filters] as const,
    assigned: (filters?: Record<string, unknown>) => ["service-requests", "assigned", filters] as const,
    detail: (id: string) => ["service-requests", id] as const,
    nearby: (lat: number, lng: number, radiusKm?: number) =>
      ["service-requests", "nearby", { lat, lng, radiusKm }] as const,
  },
  mechanics: {
    earnings: () => ["mechanics", "me", "earnings"] as const,
    inventory: (filters?: Record<string, unknown>) => ["mechanics", "me", "inventory", filters] as const,
    reviews: (mechanicId: string, filters?: Record<string, unknown>) =>
      ["mechanics", mechanicId, "reviews", filters] as const,
  },
  spareParts: {
    catalog: (filters?: Record<string, unknown>) => ["spare-parts", filters] as const,
  },
  invoices: {
    detail: (id: string) => ["invoices", id] as const,
  },
  payments: {
    my: (filters?: Record<string, unknown>) => ["payments", "my", filters] as const,
    detail: (id: string) => ["payments", id] as const,
  },
  admin: {
    stats: () => ["admin", "dashboard-stats"] as const,
    auditLogs: (filters?: Record<string, unknown>) => ["admin", "audit-logs", filters] as const,
  },
} as const;
