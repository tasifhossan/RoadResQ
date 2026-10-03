import Link from "next/link";
import { CheckCircle2, ArrowLeft, CreditCard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const resolvedParams = await searchParams;
  const requestId = typeof resolvedParams.requestId === "string" ? resolvedParams.requestId.trim() : undefined;
  const invoiceId = typeof resolvedParams.invoiceId === "string" ? resolvedParams.invoiceId.trim() : undefined;

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
            Thank you. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
          {invoiceId && (
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
