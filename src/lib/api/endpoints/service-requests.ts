import { apiFetch } from "@/lib/api/client";
import { CreateServiceRequestInput, ServiceRequest } from "@/lib/types/service-requests";

export async function createServiceRequestApi(
  data: CreateServiceRequestInput
): Promise<{ serviceRequest: ServiceRequest }> {
  return apiFetch<{ serviceRequest: ServiceRequest }>("service-requests", {
    method: "POST",
    body: data,
  });
}
