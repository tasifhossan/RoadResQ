"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ArrowLeft, CreditCard, Loader2, AlertCircle, LogIn, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getServiceRequestByIdApi } from "@/lib/api/endpoints/service-requests";
import { queryKeys } from "@/lib/api/keys";
import { ServiceRequest } from "@/lib/types/service-requests";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";

interface PaymentSuccessClientProps {
  hasSession: boolean;
  requestId?: string;
  invoiceId?: string;
  initialRequest?: ServiceRequest | null;
}

export function PaymentSuccessClient({
  hasSession,
  requestId,
  invoiceId,
  initialRequest,
}: PaymentSuccessClientProps) {
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 10; // 10 polls * 3s = 30s

  // Determine if initially paid
  const initialIsPaid =
    initialRequest?.invoice?.status === "PAID" ||
    initialRequest?.invoice?.payment?.status === "COMPLETED";

  // Client-side Query for polling if logged in, requestId exists, and not paid yet
  const { data: pollData } = useQuery({
    queryKey: requestId ? queryKeys.serviceRequests.detail(requestId) : ["service-requests", "unknown"],
    queryFn: () => getServiceRequestByIdApi(requestId!),
    enabled: hasSession && Boolean(requestId) && !initialIsPaid && pollCount < maxPolls,
    refetchInterval: (query) => {
      const request = query.state.data?.serviceRequest;
      const isPaid = request?.invoice?.status === "PAID" || request?.invoice?.payment?.status === "COMPLETED";
      if (isPaid || pollCount >= maxPolls) {
        return false;
      }
      return 3000; // Poll every 3s
    },
  });

  useEffect(() => {
    if (hasSession && requestId && !initialIsPaid && pollCount < maxPolls) {
      const timer = setInterval(() => {
        setPollCount((prev) => prev + 1);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [hasSession, requestId, initialIsPaid, pollCount]);

  const currentRequest = pollData?.serviceRequest ?? initialRequest;
  const invoice = currentRequest?.invoice;
  const isPaid = invoice?.status === "PAID" || invoice?.payment?.status === "COMPLETED";
  const isPollingExhausted = !isPaid && pollCount >= maxPolls;

  // 1. NO SESSION (Logged Out)
  if (!hasSession) {
    const nextUrl = requestId
      ? `/customer/requests/${encodeURIComponent(requestId)}`
      : "/customer/payments";
    const loginUrl = `/login?next=${encodeURIComponent(nextUrl)}`;

    return (
      <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full text-center shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <LogIn className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Payment Completed
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Payment session completed. Please log in to verify your payment status and view your service request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
            {requestId && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Request Reference</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{requestId}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={loginUrl}
              className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log In to View Status
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 2. LOGGED IN & PAYMENT STILL CONFIRMING (Polling active)
  if (requestId && !isPaid && !isPollingExhausted) {
    return (
      <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full text-center shadow-lg border-amber-100 dark:border-amber-950">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Payment is being confirmed
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              We are verifying your transaction with the gateway. Please wait...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-center text-xs text-slate-500 gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Checking status... ({pollCount * 3}s / 30s)
            </div>
          </CardContent>
          {requestId && (
            <CardFooter className="flex justify-center pt-2">
              <Link
                href={`/customer/requests/${encodeURIComponent(requestId)}`}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
              >
                Go to Request Detail
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // 3. LOGGED IN & POLLING EXHAUSTED (Not confirmed after 30s)
  if (requestId && isPollingExhausted) {
    return (
      <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full text-center shadow-lg border-amber-200 dark:border-amber-900">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Taking longer than expected
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Payment confirmation is taking longer than expected. Your invoice will update as soon as the gateway notifies us.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Request Reference</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{requestId}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/customer/requests/${encodeURIComponent(requestId)}`}
              className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
            >
              View Service Request
            </Link>
            <Link
              href="/customer/payments"
              className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              View Payments
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 4. LOGGED IN & VERIFIED PAID (or standard success display)
  return (
    <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full text-center shadow-lg border-emerald-100 dark:border-emerald-950">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
            Thank you! Your payment has been processed and verified successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
          {invoice && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Invoice Status</span>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <StatusBadge status={invoice.payment?.status || "COMPLETED"} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Total Amount Paid</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatMoney(invoice.totalCost)}
                </span>
              </div>
            </div>
          )}
          {invoiceId && !invoice && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Invoice Reference</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{invoiceId}</span>
            </div>
          )}
          {requestId && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Request Reference</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{requestId}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {requestId ? (
            <Link
              href={`/customer/requests/${encodeURIComponent(requestId)}`}
              className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
            >
              View Service Request
            </Link>
          ) : (
            <Link
              href="/customer/payments"
              className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              View Payments
            </Link>
          )}
          <Link
            href="/customer/payments"
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Payment History
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
