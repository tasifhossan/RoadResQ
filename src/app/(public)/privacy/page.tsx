import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | RoadResQ",
  description: "Privacy policy and data protection practices for RoadResQ roadside platform users.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-base">
          How RoadResQ collects, uses, and safeguards your location and account information.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Location Information</h2>
          <p>
            When you initiate a roadside assistance request, RoadResQ processes your device GPS coordinates (latitude and longitude) solely to match your request with mechanics in your area. Location coordinates are not shared with mechanics until you confirm a booking request.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Account Data</h2>
          <p>
            We collect your name, email address, and vehicle metadata (make, model, year, license plate) necessary to deliver roadside support and maintain your service history.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Payment Information</h2>
          <p>
            Payments run in the payment gateway&apos;s test mode through SSLCommerz. We do not store sensitive credit card or mobile banking numbers directly on our servers.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Contact & Inquiries</h2>
          <p>
            For privacy inquiries or account data questions, reach out via our{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Contact Page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
