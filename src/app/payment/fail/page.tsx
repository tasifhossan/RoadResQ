import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { XCircle, ArrowLeft, CreditCard, RotateCcw, LogIn } from "lucide-react";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Failed | RoadResQ",
  robots: {
    index: false,
    follow: false,
  },
};

interface PaymentFailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  const resolvedParams = await searchParams;
  const requestId = typeof resolvedParams.requestId === "string" ? resolvedParams.requestId.trim() : undefined;
  const reason = typeof resolvedParams.reason === "string" ? resolvedParams.reason.trim() : undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
  const hasSession = Boolean(token);

  // Friendly text per backend reason code in payment.controller.ts
  const reasonText =
    reason === "invalid_request"
      ? "The payment session request was invalid or incomplete."
      : reason === "validation_failed"
      ? "Payment verification failed with the gateway. If your account was debited, please contact support."
      : reason === "payment_failed"
      ? "The payment transaction failed or was rejected by the payment gateway."
      : "Your transaction could not be completed. Please try again or contact support.";

  if (!hasSession) {
    const nextUrl = requestId
      ? `/customer/requests/${encodeURIComponent(requestId)}`
      : "/customer/payments";
    const loginUrl = `/login?next=${encodeURIComponent(nextUrl)}`;

    return (
      <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full text-center shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Payment Not Completed
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Your payment attempt was not completed. Please log in to view your request status and retry payment.
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
              Log In to View Request
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full text-center shadow-lg border-red-100 dark:border-red-950">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <XCircle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
            {reasonText}
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
          {requestId ? (
            <>
              <Link
                href={`/customer/requests/${encodeURIComponent(requestId)}`}
                className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
              <Link
                href={`/customer/requests/${encodeURIComponent(requestId)}`}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
              >
                Back to Request
              </Link>
            </>
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
