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

export interface MechanicInventoryItem {
  id: string;
  mechanicProfileId: string;
  sparePartId: string;
  price: number | string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  sparePart: {
    id: string;
    name: string;
    isGlobal: boolean;
    createdByMechanicId?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

export interface GetInventoryQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
}

export interface AddInventoryItemInput {
  sparePartId?: string;
  name?: string;
  price: number;
  stock: number;
}

export interface UpdateInventoryItemInput {
  name?: string;
  price?: number;
  stock?: number;
}

export interface RestockInventoryItemInput {
  quantity: number;
}

