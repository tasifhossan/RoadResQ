import { PaginationMeta } from "@/lib/api/types";

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  plateNumber: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GetMyVehiclesQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  plateNumber: string;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  plateNumber?: string;
}

export interface VehiclesPaginatedResponse {
  items: Vehicle[];
  meta: PaginationMeta;
}
