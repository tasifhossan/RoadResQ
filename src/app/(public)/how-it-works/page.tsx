import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { REQUEST_STATUSES } from "@/lib/api/types";
import {
  UserPlus,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  FileText,
  CreditCard,
  Star,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | RoadResQ Roadside Assistance",
  description:
    "Explore the real-time breakdown rescue lifecycle on RoadResQ: from request submission and nearby mechanic dispatch to transparent spare parts invoices and SSLCommerz test payments.",
};

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Account Registration & Vehicle Setup",
    role: "Customer",
    roleVariant: "CUSTOMER" as const,
    icon: UserPlus,
    description:
      "Customer registers a new account using full name, email, phone number, and password. Once logged in, drivers can register one or multiple vehicles with make, model, and plate number for instant linkage to emergency requests.",
    details: ["Customer Role Registration", "Vehicle Make, Model & Plate Number Logging", "Stored in Customer Profile"],
  },
  {
    step: 2,
    title: "Create Emergency Service Request",
    role: "Customer",
    roleVariant: "CUSTOMER" as const,
    icon: MapPin,
    description:
      "When a vehicle breaks down, the driver submits a service request specifying GPS coordinates (lat/lng), breakdown description, priority (LOW, NORMAL, HIGH, EMERGENCY), and optionally selects a registered vehicle.",
    details: [
      "GPS Latitude & Longitude Tagging",
      "Attach up to 5 photos (JPG, PNG, WEBP max 5MB each)",
      "Priority classification from LOW to EMERGENCY",
    ],
  },
  {
    step: 3,
    title: "Radius-Based Nearby Mechanic Discovery",
    role: "Customer / System",
    roleVariant: "CUSTOMER" as const,
    icon: Navigation,
    description:
      "The system queries available mechanics by geographical distance in kilometers relative to the breakdown coordinates. The customer can view nearby mechanics' ratings, total completed jobs, and distance.",
    details: ["Distance calculation in kilometers", "Filters available mechanics by radius", "Displays verified ratings & job counts"],
  },
  {
    step: 4,
    title: "Mechanic Assignment & Acceptance",
    role: "Mechanic",
    roleVariant: "MECHANIC" as const,
    icon: Wrench,
    description:
      "The customer selects an available mechanic to assign to the request. The mechanic receives the assignment and accepts the job, changing status from SEARCHING to ASSIGNED.",
    details: ["Direct mechanic assignment", "Mechanic notification", "Status moves to ASSIGNED"],
  },
  {
    step: 5,
    title: "Live Status Tracking & Dispatch Progress",
    role: "Mechanic",
    roleVariant: "MECHANIC" as const,
    icon: Clock,
    description:
      "As the mechanic travels to the breakdown location and performs repairs, they update job status in real time: EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED.",
    details: ["Live real-time status updates", "GPS location update pings", "Sequential state transition verification"],
  },
  {
    step: 6,
    title: "On-Site Repair & Spare Parts Logging",
    role: "Mechanic",
    roleVariant: "MECHANIC" as const,
    icon: Package,
    description:
      "While status is IN_PROGRESS, the mechanic logs replacement spare parts used from their personal inventory. The unit price of each spare part is permanently frozen at the exact price-at-use timestamp.",
    details: ["Mechanic inventory tracking", "Frozen price-at-use snapshot", "Automated parts total summation"],
  },
  {
    step: 7,
    title: "Automated Itemized Invoice Generation",
    role: "System",
    roleVariant: "ADMIN" as const,
    icon: FileText,
    description:
      "When the mechanic marks the job COMPLETED, the system automatically generates an itemized invoice. The invoice combines the fixed labor fee with the total cost of parts used.",
    details: ["Labor cost calculation", "Itemized spare parts breakdown", "Total invoice amount sum"],
  },
  {
    step: 8,
    title: "Digital Payment via SSLCommerz Gateway",
    role: "Customer",
    roleVariant: "CUSTOMER" as const,
    icon: CreditCard,
    description:
      "The customer inspects the invoice breakdown and initiates digital payment. Payment is securely processed through SSLCommerz running in test mode with instant success or failure callback handling.",
    details: ["SSLCommerz sandbox gateway test mode", "Transaction ID generation", "Automated invoice state update to PAID"],
  },
  {
    step: 9,
    title: "Customer Review & Dynamic Rating Update",
    role: "Customer",
    roleVariant: "CUSTOMER" as const,
    icon: Star,
    description:
      "After completing payment, the customer submits a 1-to-5 star rating and optional review text. The backend recalculates the mechanic's overall rating average and increments their completed jobs total.",
    details: ["1 to 5 star rating submission", "Optional feedback text", "Dynamically updates mechanic profile stats"],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            End-to-End Rescue Blueprint
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            How RoadResQ Works
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Follow the complete roadside assistance lifecycle from initial vehicle registration and breakdown dispatch to frozen parts invoices and SSLCommerz test payments.
          </p>
        </div>

        {/* Real Status Flow Diagram */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Service Request Status Lifecycle
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Exact backend RequestStatus values and lifecycle transitions.
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-xs font-mono bg-muted">
              Backend Enum: RequestStatus
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {REQUEST_STATUSES.map((status, index) => (
              <div key={status} className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-background text-center space-y-1.5">
                <span className="text-[10px] font-mono text-muted-foreground font-semibold">STATE {index + 1}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>

          {/* Cancellation Rules Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-200">Cancellation Rules & Restrictions: </span>
              A service request can be cancelled by the customer while in <span className="font-mono font-medium">PENDING</span>, <span className="font-mono font-medium">SEARCHING</span>, <span className="font-mono font-medium">ASSIGNED</span>, <span className="font-mono font-medium">EN_ROUTE</span>, or <span className="font-mono font-medium">ARRIVED</span> status. Once status advances to <span className="font-mono font-medium">IN_PROGRESS</span> or <span className="font-mono font-medium">COMPLETED</span>, cancellation is locked to protect repair work in progress.
            </div>
          </div>
        </div>

        {/* Numbered Steps */}
        <div className="space-y-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
            9-Step Emergency Assistance Workflow
          </h2>

          <div className="space-y-6">
            {WORKFLOW_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="rounded-2xl border-border/80 shadow-xs overflow-hidden transition-all hover:border-primary/40">
                  <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg shadow-sm">
                        0{item.step}
                      </div>
                      <div className="md:hidden">
                        <StatusBadge status={item.roleVariant} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary shrink-0" />
                          {item.title}
                        </h3>
                        <div className="hidden md:block">
                          <StatusBadge status={item.roleVariant} />
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-2">
                        {item.details.map((detail, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-medium text-foreground border border-border/50">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/80 text-center space-y-6">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-xs">
            Interactive Rescue Demo
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Test the Full Workflow Today
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Try creating a service request as a Customer, accepting it as a Mechanic, logging spare parts, and completing an SSLCommerz test payment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 h-12">
                Register New Account
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-border rounded-xl px-8 h-12">
                Try Quick Demo Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
