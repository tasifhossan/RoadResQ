import { RequestStatus } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";

export type User = UserProfile;

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  bio?: string | null;
  city?: string | null;
  yearsExperience?: number | null;
}

export interface CustomerSummaryData {
  requestsByStatus: Record<RequestStatus, number>;
  spendByMonth: Array<{
    month: string;
    amount: string;
  }>;
  totals: {
    requests: number;
    completed: number;
    totalPaid: string;
    unpaidInvoices: number;
  };
}

export type GetMySummaryQueryInput = Record<string, unknown>;
