import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  CreateServiceRequestInput,
  ServiceRequest,
  ServiceRequestListQueryInput,
  ServiceRequestReview,
  NearbyMechanicItem,
} from "@/lib/types/service-requests";

export interface ServiceRequestImage {
  id: string;
  serviceRequestId: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

export async function createServiceRequestApi(
  data: CreateServiceRequestInput
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>("service-requests", {
    method: "POST",
    body: data,
  });
}

export async function getMyServiceRequestsApi(
  query?: ServiceRequestListQueryInput
): Promise<Paginated<ServiceRequest>> {
  return apiFetch<Paginated<ServiceRequest>>("service-requests/my", { query });
}

export async function getServiceRequestByIdApi(
  id: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}`);
}

export async function getServiceRequestImagesApi(
  id: string
): Promise<{ images: ServiceRequestImage[] }> {
  return apiFetch<{ images: ServiceRequestImage[] }>(`service-requests/${id}/images`);
}

export async function assignMechanicApi(
  id: string,
  mechanicId: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}/assign`, {
    method: "POST",
    body: { mechanicId },
  });
}

export async function createReviewApi(
  id: string,
  data: { rating: number; comment?: string }
): Promise<{ review: ServiceRequestReview }> {
  return apiFetch<{ review: ServiceRequestReview }>(`service-requests/${id}/review`, {
    method: "POST",
    body: data,
  });
}

export async function getNearbyMechanicsApi(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<{ mechanics: NearbyMechanicItem[] }> {
  return apiFetch<{ mechanics: NearbyMechanicItem[] }>(
    "service-requests/nearby-mechanics",
    {
      query: { lat, lng, radiusKm },
    }
  );
}

export async function cancelServiceRequestApi(
  id: string,
  reason?: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}/cancel`, {
    method: "PATCH",
    body: reason ? { reason } : {},
  });
}

export async function getAssignedServiceRequestsApi(
  query?: ServiceRequestListQueryInput
): Promise<Paginated<ServiceRequest>> {
  return apiFetch<Paginated<ServiceRequest>>("service-requests/assigned", { query });
}

export async function acceptAssignmentApi(
  id: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}/accept`, {
    method: "POST",
  });
}

export async function updateServiceRequestStatusApi(
  id: string,
  status: string,
  laborCost?: number
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}/status`, {
    method: "PATCH",
    body: { status, ...(laborCost !== undefined ? { laborCost } : {}) },
  });
}

