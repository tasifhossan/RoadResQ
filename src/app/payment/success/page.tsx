import { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { getServiceRequestByIdServer } from "@/lib/api/endpoints/service-requests.server";
import { ServiceRequest } from "@/lib/types/service-requests";
import { PaymentSuccessClient } from "./payment-success-client";

export const metadata: Metadata = {
  title: "Payment Successful | RoadResQ",
  robots: {
    index: false,
    follow: false,
  },
};

interface PaymentSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const resolvedParams = await searchParams;
  const requestId = typeof resolvedParams.requestId === "string" ? resolvedParams.requestId.trim() : undefined;
  const invoiceId = typeof resolvedParams.invoiceId === "string" ? resolvedParams.invoiceId.trim() : undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  const hasSession = Boolean(token);

  let initialRequest: ServiceRequest | null = null;

  if (hasSession && token && requestId) {
    try {
      const res = await getServiceRequestByIdServer(token, requestId);
      initialRequest = res.serviceRequest;
    } catch {
      // Ignore lookup failure (e.g. unknown ID or unauthorized request)
    }
  }

  return (
    <PaymentSuccessClient
      hasSession={hasSession}
      requestId={requestId}
      invoiceId={invoiceId}
      initialRequest={initialRequest}
    />
  );
}
