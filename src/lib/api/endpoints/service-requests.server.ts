import "server-only";
import { serverFetch } from "@/lib/api/server";
import { Paginated } from "@/lib/api/types";
import { ServiceRequest, ServiceRequestListQueryInput } from "@/lib/types/service-requests";

export async function getMyServiceRequestsServer(
  token: string,
  query?: ServiceRequestListQueryInput
): Promise<Paginated<ServiceRequest>> {
  return serverFetch<Paginated<ServiceRequest>>("service-requests/my", {
    token,
    query,
  });
}

export async function getServiceRequestByIdServer(
  token: string,
  id: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return serverFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}`, {
    token,
  });
}
