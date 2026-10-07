import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCtas } from "@/components/home/hero-ctas";
import {
  Wrench,
  Car,
  ShieldCheck,
  FileText,
  MapPin,
  CreditCard,
  Star,
  Activity,
  ArrowRight,
  Package,
  Navigation,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28 bg-gradient-to-b from-background via-muted/30 to-background border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Roadside Assistance Demo • SSLCommerz Gateway Test Mode
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                On-Demand Roadside Rescue,{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                  From Breakdown to Payment
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                RoadResQ is a full-stack emergency roadside assistance platform. Experience the real-time workflow connecting drivers with nearby mechanics, live status tracking, frozen parts pricing, itemized invoices, and test-mode digital payments.
              </p>

              <div className="pt-2 w-full sm:w-auto">
                <HeroCtas />
              </div>

              {/* Key Platform Facts */}
              <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left w-full max-w-md">
                <div className="px-1">
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Roles</p>
                  <p className="text-xs sm:text-base font-semibold text-foreground mt-0.5">3 Supported</p>
                </div>
                <div className="px-1">
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Dispatch</p>
                  <p className="text-xs sm:text-base font-semibold text-foreground mt-0.5">Live Distance</p>
                </div>
                <div className="px-1">
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Payments</p>
                  <p className="text-xs sm:text-base font-semibold text-foreground mt-0.5">Test Gateway</p>
                </div>
              </div>
            </div>

            {/* Right Visual (Pure CSS & Inline SVG) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-xl overflow-hidden">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive/80" />
                    <div className="h-3 w-3 rounded-full bg-accent/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-muted-foreground">Live Rescue Workflow</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono bg-muted border-border">
                    STATUS: IN_PROGRESS
                  </Badge>
                </div>

                {/* Simulated Workflow Visual */}
                <div className="space-y-4">
                  {/* Step 1 Node */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground truncate">1. Customer Request</p>
                        <span className="text-[11px] text-muted-foreground font-mono">GPS Tagged</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">Vehicle: Sedan • Battery jump required</p>
                    </div>
                  </div>

                  {/* Connecting Vector */}
                  <div className="flex justify-center -my-2">
                    <svg className="h-6 w-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Step 2 Node */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground truncate">2. Mechanic Dispatched</p>
                        <span className="text-[11px] text-accent font-mono font-medium">EN_ROUTE</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">Nearest available within 3.2 km radius</p>
                    </div>
                  </div>

                  {/* Connecting Vector */}
                  <div className="flex justify-center -my-2">
                    <svg className="h-6 w-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Step 3 Node */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground truncate">3. Invoice & Payment</p>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">SSLCommerz</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">Labor + Spare parts (price frozen at use)</p>
                    </div>
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
                    Live status updates
                  </span>
                  <span className="font-mono text-[11px]">Sandbox Test Environment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="py-16 sm:py-24 bg-card border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
              Rescue Lifecycle
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              How RoadResQ Works
            </h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground">
              A transparent, step-by-step workflow connecting stranded drivers with on-site mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg mb-5">
                01
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Create Request</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Select your registered vehicle, capture your breakdown coordinates, and describe the roadside emergency.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-medium text-primary">
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                GPS Location Tagged
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold text-lg mb-5">
                02
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Mechanic Dispatch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                System searches nearby available mechanics within range. The assigned mechanic updates job status from En Route to Arrived.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-medium text-accent">
                <Navigation className="mr-1.5 h-3.5 w-3.5" />
                Radius Distance Search
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg mb-5">
                03
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Service & Parts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Mechanic performs repairs and logs replacement parts from inventory. Item prices are locked at the exact time of service.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-medium text-primary">
                <Package className="mr-1.5 h-3.5 w-3.5" />
                Frozen Price-at-Use
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-5">
                04
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Invoice & Review</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Receive an itemized digital invoice for labor and parts. Complete payment via SSLCommerz test mode and submit a rating.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Star className="mr-1.5 h-3.5 w-3.5" />
                SSLCommerz & Rating
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-3 py-1.5"
            >
              Read full workflow guide
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Built for Three Roles Section */}
      <section className="py-16 sm:py-24 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider border-accent/30 text-accent">
              Multi-Role Ecosystem
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              Built for Three Specialized Roles
            </h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground">
              Explore authentic features built specifically for Drivers, Field Mechanics, and System Administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Role Card */}
            <Card className="rounded-2xl border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Car className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Customer</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  For drivers needing roadside assistance or vehicle tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground pt-0 flex-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Register and manage your personal vehicles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Dispatch emergency roadside requests with GPS location</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Track mechanic assignment and status progress live</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>View itemized invoices for labor and spare parts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Pay via SSLCommerz gateway (test mode) and submit ratings</span>
                </div>
              </CardContent>
            </Card>

            {/* Mechanic Role Card */}
            <Card className="rounded-2xl border-border/80 shadow-sm flex flex-col justify-between hover:border-accent/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Mechanic</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  For service technicians responding to breakdown calls in the field.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground pt-0 flex-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>Toggle status between Available, Busy, and Offline</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>Ping current live location coordinates for distance search</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>Accept nearby service requests and update job statuses</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>Log spare parts used from inventory directly into active jobs</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>Build reputation with rating averages and job counters</span>
                </div>
              </CardContent>
            </Card>

            {/* Admin Role Card */}
            <Card className="rounded-2xl border-border/80 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Admin</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  For platform managers overseeing operations, catalog, and security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground pt-0 flex-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Manage user accounts, credentials, and role promotions</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Define and curate the global spare parts catalog</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Monitor system dashboard metrics (users, requests, revenue)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Inspect comprehensive security audit logs and action histories</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Maintain system configuration and role boundary enforcement</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Platform Highlights (Real Features Only) Section */}
      <section className="py-16 sm:py-24 bg-card border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
              Core Technical Features
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              Platform Highlights
            </h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground">
              Grounded strictly in the capabilities implemented across the RoadResQ API modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Highlight 1 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Live Status Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Follow job state transitions in real-time as mechanics update progress from PENDING and SEARCHING to EN_ROUTE, ARRIVED, IN_PROGRESS, and COMPLETED.
              </p>
            </div>

            {/* Highlight 2 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nearby Mechanic Search</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Radius-based search discovers online mechanics using exact latitude/longitude coordinates and calculates distance in kilometers to the breakdown site.
              </p>
            </div>

            {/* Highlight 3 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Transparent Invoices</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatic invoice generation breaks down labor fees and replacement parts. Spare part unit prices are permanently frozen at the moment they are logged.
              </p>
            </div>

            {/* Highlight 4 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">SSLCommerz Test Payments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integrated online payment checkout running safely in SSLCommerz test mode, updating invoice status with transaction IDs and callback validation.
              </p>
            </div>

            {/* Highlight 5 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background shadow-sm space-y-3 md:col-span-2 lg:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dynamic Mechanic Ratings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customer reviews and 1-to-5 star ratings feed directly into backend calculations, dynamically updating the mechanic’s overall average rating and job history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final Call-to-Action Band */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary px-4 py-1 text-xs font-semibold rounded-full">
            Demonstration Environment
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready to Test RoadResQ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Create an account or log in with demo credentials to experience roadside rescue requests, mechanic job management, invoice generation, and SSLCommerz test payments.
          </p>

          <div className="mt-8 flex justify-center">
            <HeroCtas />
          </div>
        </div>
      </section>
    </div>
  );
}
