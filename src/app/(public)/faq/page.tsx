import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | RoadResQ Frequently Asked Questions",
  description:
    "Find answers to common questions about RoadResQ: mechanic dispatching, request cancellations, invoice pricing, photo upload limits, SSLCommerz test mode, and demo accounts.",
};

const FAQ_ITEMS = [
  {
    value: "item-1",
    question: "How are mechanics discovered and chosen for a breakdown request?",
    answer:
      "Mechanics are discovered using radius-based search matching the customer's GPS latitude and longitude coordinates. Customers can specify a search radius in kilometers, review nearby mechanics' rating averages, distance, and total completed jobs, and assign their preferred mechanic.",
  },
  {
    value: "item-2",
    question: "Can a service request be cancelled, and until when?",
    answer:
      "Yes. A customer can cancel a service request while its status is PENDING, SEARCHING, ASSIGNED, EN_ROUTE, or ARRIVED. Once the mechanic transitions the job to IN_PROGRESS or COMPLETED, cancellation is locked to protect repair work already underway.",
  },
  {
    value: "item-3",
    question: "How is the final invoice price calculated?",
    answer:
      "The total invoice amount is the sum of the fixed labor fee plus the total cost of spare parts used. When a mechanic logs replacement parts from their inventory during repair, unit prices are permanently frozen at the exact price-at-use timestamp.",
  },
  {
    value: "item-4",
    question: "What are the accepted photo upload types and file count limits?",
    answer:
      "Customers can attach up to 5 images when creating or updating a service request. Allowed file extensions are JPG, JPEG, PNG, and WEBP with a maximum file size limit of 5MB per photo, uploaded securely via Cloudinary.",
  },
  {
    value: "item-5",
    question: "How does payment processing work on RoadResQ?",
    answer:
      "Digital payments are processed via the SSLCommerz payment gateway operating safely in sandbox test mode. Real credit cards are never charged, and test transactions generate authentic gateway callbacks and invoice state updates.",
  },
  {
    value: "item-6",
    question: "What happens if an SSLCommerz payment fails or is cancelled?",
    answer:
      "If a payment attempt fails or is cancelled on the SSLCommerz gateway interface, the transaction is marked FAILED or CANCELLED. The invoice remains in PENDING status so the customer can retry payment whenever ready.",
  },
  {
    value: "item-7",
    question: "How do mechanic ratings and customer reviews work?",
    answer:
      "After completing payment for a request, the customer can submit a 1-to-5 star rating and an optional feedback comment. The backend automatically recalculates the mechanic's overall average rating and increments their completed jobs total.",
  },
  {
    value: "item-8",
    question: "What are demo accounts and how can I test them?",
    answer:
      "The login page includes quick demo login buttons for Customer, Mechanic, and Admin roles. Clicking a demo button instantly logs you in using pre-seeded test credentials without needing to fill out registration forms.",
  },
  {
    value: "item-9",
    question: "How does the 'Use demo location' shortcut work?",
    answer:
      "Seeded mechanics in the database are located around Dhaka coordinates (e.g., lat ~23.8103, lng ~90.4125). In the request wizard, clicking 'Use demo location' fills these coordinates automatically so nearby mechanics can be discovered in test mode.",
  },
  {
    value: "item-10",
    question: "Are credit card or bank details stored on RoadResQ servers?",
    answer:
      "No. RoadResQ never collects, processes, or stores credit card numbers or banking passwords on its servers. All payment information is entered directly on SSLCommerz's PCI-compliant sandbox gateway page.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            Platform Help & Verification
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every answer is verified against RoadResQ API specifications, Prisma database schemas, and SSLCommerz test mode behavior.
          </p>
        </div>

        {/* Demo Shortcut Tip Alert */}
        <div className="p-5 sm:p-6 rounded-3xl bg-accent/10 border border-accent/30 flex items-start gap-4">
          <MapPin className="h-6 w-6 shrink-0 text-accent mt-0.5" />
          <div className="space-y-1 text-sm text-foreground">
            <p className="font-bold text-accent">Demo Testing Pro Tip: Dhaka Location Coordinates</p>
            <p className="text-muted-foreground leading-relaxed">
              Because backend seed data places test mechanics near Dhaka (lat: <span className="font-mono text-foreground font-medium">23.8103</span>, lng: <span className="font-mono text-foreground font-medium">90.4125</span>), use the <span className="font-semibold text-foreground">&quot;Use demo location&quot;</span> button in the request wizard to instantly locate available test mechanics!
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          <Accordion type="single" defaultValue="item-1">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Closing CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/80 text-center space-y-6">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-xs">
            Ready to Rescue?
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Still Have Questions?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Test the live rescue workflow on our demo platform, or contact support if you need assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 h-12">
                Try Demo Accounts
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-border rounded-xl px-8 h-12">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
