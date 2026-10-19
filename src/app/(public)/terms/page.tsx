import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | RoadResQ",
  description: "Terms and conditions for utilizing RoadResQ roadside emergency and mechanic matching services.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Terms governing your access to and use of the RoadResQ emergency platform.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Platform Services</h2>
          <p>
            RoadResQ provides a digital dispatch and coordination platform connecting stranded motorists with independent roadside mechanics. Service availability depends on active mechanics in your district.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Service Requests & Cancellations</h2>
          <p>
            Customers may cancel a service request while it is in PENDING, SEARCHING, ASSIGNED, EN_ROUTE, or ARRIVED status. Once repair work commences (IN_PROGRESS or COMPLETED), cancellation is locked.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Invoicing & Parts Pricing</h2>
          <p>
            Invoices reflect the base labor charge plus any spare parts installed during the job. Part prices are recorded at the exact timestamp of inventory logging.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Test Mode Payments</h2>
          <p>
            Payments run in the payment gateway&apos;s test mode. No actual financial transactions are processed during platform testing and evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
