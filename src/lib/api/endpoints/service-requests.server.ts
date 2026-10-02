import "server-only";
import { serverFetch } from "@/lib/api/server";
import { ServiceRequest } from "@/lib/types/service-requests";

export async function getServiceRequestByIdServer(
  token: string,
  id: string
): Promise<{ serviceRequest: ServiceRequest }> {
  return serverFetch<{ serviceRequest: ServiceRequest }>(`service-requests/${id}`, {
    token,
  });
}
