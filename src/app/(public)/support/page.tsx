import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Support | RoadResQ",
  description: "Get assistance with your RoadResQ account, service requests, invoices, and payment queries.",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Support Center</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Need help with an ongoing service request, invoice question, or platform issue? We&apos;re here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">
              Review answers to common questions about mechanic discovery, dispatching, cancellations, and test payments.
            </p>
          </div>
          <Link href="/faq">
            <Button variant="outline" className="w-full rounded-xl">
              Visit FAQ
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Contact Form</h2>
            <p className="text-sm text-muted-foreground">
              Submit an inquiry directly through our validated contact form for assistance with your account.
            </p>
          </div>
          <Link href="/contact">
            <Button className="w-full rounded-xl">
              Contact Us
            </Button>
          </Link>
        </div>

        {siteConfig.contactEmail && (
          <div className="sm:col-span-2 rounded-xl border border-border bg-card p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Direct Email Support</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send an email directly to{" "}
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="text-primary underline underline-offset-4 font-medium"
                >
                  {siteConfig.contactEmail}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
