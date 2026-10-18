import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  RequestStatus,
  PaymentStatus,
  InvoiceStatus,
  Availability,
  Role,
  RequestPriority,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type StatusValue =
  | RequestStatus
  | PaymentStatus
  | InvoiceStatus
  | Availability
  | Role
  | RequestPriority
  | string;

export interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

/**
 * STN-7 Palette Mapping:
 * Only 3 brand colors (blue, orange, red) plus neutrals are permitted.
 *
 * Status mapping:
 * - PENDING, SEARCHING, OFFLINE, LOW, REFUNDED = neutral (slate)
 * - ASSIGNED, EN_ROUTE, ARRIVED, NORMAL, AVAILABLE, CUSTOMER = blue tint
 * - IN_PROGRESS, BUSY, HIGH, MECHANIC = orange tint
 * - COMPLETED, PAID = solid blue (success states use blue or neutral, never green)
 * - CANCELLED, FAILED, EMERGENCY = red tint
 * - ADMIN = neutral strong (slate)
 */
const statusStyles: Record<string, { label: string; className: string }> = {
  // RequestStatus
  PENDING: { label: "Pending", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/30" },
  SEARCHING: { label: "Searching", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/30" },
  ASSIGNED: { label: "Assigned", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  EN_ROUTE: { label: "En Route", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  ARRIVED: { label: "Arrived", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  IN_PROGRESS: { label: "In Progress", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/30" },
  COMPLETED: { label: "Completed", className: "bg-blue-600 text-white border-blue-700 font-semibold dark:bg-blue-600 dark:text-white dark:border-blue-500" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/30" },

  // Invoice / Payment Status
  PAID: { label: "Paid", className: "bg-blue-600 text-white border-blue-700 font-semibold dark:bg-blue-600 dark:text-white dark:border-blue-500" },
  FAILED: { label: "Failed", className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/30" },
  REFUNDED: { label: "Refunded", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/30" },

  // Availability
  AVAILABLE: { label: "Available", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  BUSY: { label: "Busy", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/30" },
  OFFLINE: { label: "Offline", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/30" },

  // Priority
  LOW: { label: "Low", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300 dark:border-slate-500/30" },
  NORMAL: { label: "Normal", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  HIGH: { label: "High", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/30" },
  EMERGENCY: { label: "Emergency", className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/30" },

  // Role
  CUSTOMER: { label: "Customer", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/30" },
  MECHANIC: { label: "Mechanic", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:border-orange-500/30" },
  ADMIN: { label: "Admin", className: "bg-slate-800 text-slate-100 border-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-300" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusStyles[status] || {
    label: String(status),
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium rounded-full px-2.5 py-0.5 text-xs capitalize", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
