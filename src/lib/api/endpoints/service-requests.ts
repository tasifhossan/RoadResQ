import { apiFetch } from "@/lib/api/client";
import { Paginated } from "@/lib/api/types";
import {
  CreateServiceRequestInput,
  ServiceRequest,
  ServiceRequestListQueryInput,
  ServiceRequestReview,
  ServiceRequestMechanicDetail,
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
): Promise<{ mechanics: ServiceRequestMechanicDetail[] }> {
  return apiFetch<{ mechanics: ServiceRequestMechanicDetail[] }>(
    "service-requests/nearby-mechanics",
    {
      query: { lat, lng, radiusKm },
    }
  );
}
