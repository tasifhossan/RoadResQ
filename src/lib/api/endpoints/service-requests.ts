import { apiFetch } from "@/lib/api/client";
import { CreateServiceRequestInput, ServiceRequest } from "@/lib/types/service-requests";

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
