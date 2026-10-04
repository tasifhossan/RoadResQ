import { REQUEST_PRIORITIES, REQUEST_STATUSES } from "@/lib/api/types";
import { Vehicle } from "@/lib/types/vehicles";
import { ServiceRequestImage } from "@/lib/api/endpoints/service-requests";

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

export interface NearbyMechanicsQueryInput extends Record<string, unknown> {
  lat: number;
  lng: number;
  radiusKm?: number;
}

export interface NearbyMechanicItem {
  id: string;
  name: string;
  skills?: string[];
  rating: number;
  distance: number;
  distanceKm?: number;
  availability?: string;
  totalJobs?: number;
}

export interface StatusHistoryItem {
  id: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus | null;
  timestamp: string;
  actorRole: string | null;
}

export interface ServiceRequestPartUsed {
  id: string;
  serviceRequestId: string;
  sparePartId: string;
  quantity: number;
  priceAtUse: number;
  sparePart?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
  } | null;
}

export interface ServiceRequestInvoice {
  id: string;
  serviceRequestId: string;
  customerId: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  payment?: {
    id: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    createdAt: string;
  } | null;
}

export interface ServiceRequestReview {
  id: string;
  serviceRequestId: string;
  customerId: string;
  mechanicId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface MechanicPublicProfile {
  rating: number;
  availability: string;
  currentLat?: number | null;
  currentLng?: number | null;
  totalJobs?: number;
}

export interface ServiceRequestMechanicDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  mechanicProfile?: MechanicPublicProfile | null;
}

export interface ServiceRequestCustomerDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
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
  customer?: ServiceRequestCustomerDetail | null;
  vehicle?: Vehicle | null;
  mechanic?: ServiceRequestMechanicDetail | null;
  images?: ServiceRequestImage[];
  partsUsed?: ServiceRequestPartUsed[];
  invoice?: ServiceRequestInvoice | null;
  review?: ServiceRequestReview | null;
  statusHistory?: StatusHistoryItem[];
}

export interface CancelServiceRequestInput {
  reason?: string;
}
