import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { ServiceRequest } from "@/lib/types/service-requests";
import { getServiceRequestByIdServer } from "@/lib/api/endpoints/service-requests.server";
import { RequestDetailClient } from "./request-detail-client";

interface ServiceRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceRequestDetailPage({
  params,
}: ServiceRequestDetailPageProps) {
  // 1. Enforce CUSTOMER authentication
  await requireRole("CUSTOMER");

  const resolvedParams = await params;
  const requestId = resolvedParams.id;

  // 2. Read access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialRequest: ServiceRequest | null = null;

  if (token) {
    try {
      const res = await getServiceRequestByIdServer(token, requestId);
      initialRequest = res.serviceRequest;
    } catch {
      // 404 triggers notFound()
      notFound();
    }
  } else {
    notFound();
  }

  if (!initialRequest) {
    notFound();
  }

  return (
    <RequestDetailClient
      initialRequest={initialRequest}
      requestId={requestId}
    />
  );
}
