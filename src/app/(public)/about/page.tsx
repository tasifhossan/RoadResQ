import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Server,
  Layers,
  Database,
  CreditCard,
  ShieldCheck,
  Car,
  Wrench,
  ExternalLink,
  Code2,
  FileCode2,
  ArrowRight,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | RoadResQ Architecture & Tech Stack",
  description:
    "Learn about RoadResQ: a full-stack emergency roadside assistance demo platform built with Next.js 16, Express, Prisma ORM, PostgreSQL, SSLCommerz test mode, and Cloudinary.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            Platform Architecture & Purpose
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            About RoadResQ
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            RoadResQ is a full-stack demonstration platform engineered to model end-to-end emergency roadside assistance, live mechanic dispatch, transparent spare parts billing, and digital payment gateway integration.
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
              Stranded drivers often encounter delay, lack of visibility into dispatch status, unverified mechanic arrivals, and unpredictable repair pricing when vehicles break down on the road.
            </p>
          </Card>

          <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">The RoadResQ Solution</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              RoadResQ solves these pain points through radius-based mechanic discovery, real-time job status streaming, frozen spare part unit pricing at time of use, itemized invoices, and test-mode online payments.
            </p>
          </Card>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Full-Stack Technology Stack</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Built with modern, production-grade technologies organized cleanly into frontend and backend layers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Frontend Layer</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Next.js 16 (App Router), TypeScript, TailwindCSS v4, TanStack Query v5, Zustand, Lucide icons, and shadcn UI components.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Backend API</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Node.js, Express, TypeScript, Zod schema validation, JWT auth with httpOnly cookies, and centralized error handling.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Database & ORM</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                PostgreSQL database queried through Prisma ORM with strict schemas, migrations, relations, and seed scripts.
              </p>
            </Card>

            <Card className="rounded-2xl border-border/80 p-6 space-y-3 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Gateway & Media</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                SSLCommerz digital payment gateway (running in test mode) and Cloudinary cloud storage for image attachments.
              </p>
            </Card>
          </div>
        </div>

        {/* Supported Roles */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Three Ecosystem Roles</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Strict role-based access control (RBAC) enforced via proxy middleware and server checks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Customer Role</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Manages vehicles, dispatches roadside assistance requests, tracks status live, views invoices, pays via SSLCommerz, and rates mechanics.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-bold text-foreground">Mechanic Role</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Manages online availability, pings GPS coordinates, accepts nearby jobs, logs replacement parts from inventory, and completes repairs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-foreground">Admin Role</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Oversees user roles and promotions, manages global spare parts catalog, monitors platform metrics, and inspects security audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Open Repository Links */}
        <div className="p-8 rounded-3xl border border-border/80 bg-card shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-primary" />
                Source Code & Repository Links
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Explore the public repository containing full-stack source code and Postman collection definitions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <a
              href="https://github.com/tasifhossan/RoadResQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Code2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  GitHub Repository (RoadResQ)
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            <Link
              href="/how-it-works"
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  Workflow & API Specification
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </Link>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/80 text-center space-y-6">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary px-3 py-1 text-xs">
            Open Platform Demo
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Explore RoadResQ Features
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Test driver requests, mechanic status dispatching, and SSLCommerz test payments on our demo environment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-8 h-12">
                Get Started (Register)
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-border rounded-xl px-8 h-12">
                Try Demo Accounts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
