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

const statusStyles: Record<string, { label: string; className: string }> = {
  // RequestStatus
  PENDING: { label: "Pending", className: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" },
  SEARCHING: { label: "Searching", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400" },
  ASSIGNED: { label: "Assigned", className: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:text-indigo-400" },
  EN_ROUTE: { label: "En Route", className: "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400" },
  ARRIVED: { label: "Arrived", className: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-400" },
  IN_PROGRESS: { label: "In Progress", className: "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-400" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400" },

  // Invoice / Payment Status
  PAID: { label: "Paid", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
  FAILED: { label: "Failed", className: "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400" },
  REFUNDED: { label: "Refunded", className: "bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-400" },

  // Availability
  AVAILABLE: { label: "Available", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
  BUSY: { label: "Busy", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400" },
  OFFLINE: { label: "Offline", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-400" },

  // Priority
  LOW: { label: "Low", className: "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-400" },
  NORMAL: { label: "Normal", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400" },
  HIGH: { label: "High", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400" },
  EMERGENCY: { label: "Emergency", className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400" },

  // Role
  CUSTOMER: { label: "Customer", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400" },
  MECHANIC: { label: "Mechanic", className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400" },
  ADMIN: { label: "Admin", className: "bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-400" },
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
