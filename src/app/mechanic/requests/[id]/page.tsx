import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { ServiceRequest } from "@/lib/types/service-requests";
import { getServiceRequestByIdServer } from "@/lib/api/endpoints/service-requests.server";
import { MechanicRequestDetailClient } from "./mechanic-request-detail-client";

interface MechanicRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MechanicRequestDetailPage({
  params,
}: MechanicRequestDetailPageProps) {
  await requireRole("MECHANIC");

  const resolvedParams = await params;
  const requestId = resolvedParams.id;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialRequest: ServiceRequest | null = null;

  if (token) {
    try {
      const res = await getServiceRequestByIdServer(token, requestId);
      initialRequest = res.serviceRequest;
    } catch {
      notFound();
    }
  } else {
    notFound();
  }

  if (!initialRequest) {
    notFound();
  }

  return (
    <MechanicRequestDetailClient
      initialRequest={initialRequest}
      requestId={requestId}
    />
  );
}
