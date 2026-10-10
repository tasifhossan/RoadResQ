import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Zap,
  HeartHandshake,
  Clock,
  Award,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | RoadResQ Roadside Assistance",
  description:
    "Learn about RoadResQ: Our mission to provide instant, reliable, and transparent roadside assistance for drivers everywhere.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            Our Story & Mission
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            About RoadResQ
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            RoadResQ is an on-demand emergency roadside assistance platform designed to keep drivers safe and connected with certified nearby mechanics whenever breakdowns happen.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-border/80 shadow-xs text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe no motorist should ever feel stranded, helpless, or overcharged during a vehicle emergency. RoadResQ bridges the gap between stranded drivers and qualified technicians through instant location dispatch, fair transparent pricing, and real-time repair status tracking.
          </p>
        </div>

        {/* Problem & Solution Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive font-bold">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">The Roadside Emergency Challenge</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When a vehicle breaks down unexpectedly, drivers face long waiting times, uncertain arrival estimates, lack of verified technician credentials, and unpredictable repair pricing.
            </p>
          </Card>

          <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">The RoadResQ Solution</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              RoadResQ streamlines the rescue process with automated GPS-based mechanic matching, live status updates from dispatch to repair completion, upfront itemized billing, and secure digital payments.
            </p>
          </Card>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Core Commitments</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Built around reliability, safety, and transparency for every ride.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Rapid Response</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with nearby available mechanics instantly to minimize waiting time on hazardous roadsides.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Verified Experts</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All mechanics on RoadResQ are vetted, rated, and reviewed by fellow drivers in your community.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Fair Pricing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Clear itemized billing for labor and spare parts with no hidden surcharges or surprise costs.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Live Tracking</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Track your mechanic&apos;s progress step-by-step from arrival to repair completion in real time.
              </p>
            </Card>
          </div>
        </div>

        {/* What Sets Us Apart */}
        <div className="p-8 rounded-3xl border border-border/80 bg-card shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Why Drivers Trust RoadResQ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">24/7 Availability</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Emergency assistance coverage available day and night across major routes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Multi-Vehicle Support</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Save your cars, motorcycles, or commercial vehicles in one central account.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Seamless Digital Payments</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Pay safely online via credit card or digital wallets with instant digital receipts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Community Ratings & Reviews</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Rate your repair experience to help maintain high quality service standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/80 text-center space-y-6">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-xs">
            Roadside Peace of Mind
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready for Worry-Free Driving?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join RoadResQ today and get instant access to reliable emergency roadside assistance whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 h-12">
                Create Free Account
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-border rounded-xl px-8 h-12">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

