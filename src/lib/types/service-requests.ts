import { REQUEST_PRIORITIES, REQUEST_STATUSES } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface CreateServiceRequestInput {
  description: string;
  lat: number;
  lng: number;
  vehicleId?: string;
  priority?: RequestPriority;
}

export interface ServiceRequestListQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ServiceRequestMechanic {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  mechanicId: string | null;
  vehicleId: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  description: string;
  lat: number;
  lng: number;
  laborCost: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle | null;
  mechanic?: ServiceRequestMechanic | null;
}
