import { AVAILABILITIES } from "@/lib/api/types";

export type Availability = (typeof AVAILABILITIES)[number];

export interface UpdateAvailabilityInput {
  availability: Availability;
}

export interface UpdateLocationInput {
  lat: number;
  lng: number;
}

export interface MonthlyEarnings {
  month: string;
  laborTotal: string;
  partsTotal: string;
  jobs: number;
}

export interface RecentPaidInvoice {
  invoiceId: string;
  serviceRequestId: string;
  total: string;
  paidAt: string;
}

export interface EarningsSummary {
  totals: {
    laborTotal: string;
    partsTotal: string;
    grandTotal: string;
  };
  pendingAmount: string;
  completedJobs: number;
  averageRating: number;
  monthly: MonthlyEarnings[];
  recent: RecentPaidInvoice[];
}
