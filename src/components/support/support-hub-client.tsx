"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  X,
  Wrench,
  HelpCircle,
  FileQuestion,
  MapPin,
  ExternalLink,
  Mail,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export interface TroubleshootingTopic {
  id: string;
  category: "Account" | "Requests" | "Payments" | "Mechanics";
  question: string;
  answer: string[];
  list?: string[];
  links?: { label: string; href: string }[];
}

export const TROUBLESHOOTING_TOPICS: TroubleshootingTopic[] = [
  // Category: Account
  {
    id: "account-demo-logins",
    category: "Account",
    question: "How do the one-click demo accounts work?",
    answer: [
      "On the login page, RoadResQ provides three pre-configured demo buttons: 'Customer', 'Mechanic', and 'Admin'. Clicking any button instantly authenticates you into that role with active demo credentials, without needing to verify an email or fill in passwords.",
      "Each demo account possesses specific simulated permissions: Customers can submit requests and manage vehicles; Mechanics can accept assigned jobs and log spare parts; Admins can review platform-wide requests and audit logs.",
    ],
    links: [{ label: "Go to Login Page", href: "/login" }],
  },
  {
    id: "account-google-oauth",
    category: "Account",
    question: "Can I register or sign in with Google OAuth?",
    answer: [
      "Yes. The login and registration pages both support Google OAuth authentication. When you select 'Continue with Google', RoadResQ authenticates your identity via Google's secure OAuth 2.0 flow.",
      "Only your verified name and primary email address are retrieved. An account is automatically provisioned with the Customer role, allowing immediate access to roadside dispatch.",
    ],
    links: [{ label: "Register New Account", href: "/register" }],
  },
  {
    id: "account-session-cookies",
    category: "Account",
    question: "How are authentication sessions maintained securely?",
    answer: [
      "RoadResQ avoids storing sensitive authentication tokens in browser localStorage. Instead, authentication tokens are delivered as secure, httpOnly cookies named 'accessToken' and 'refreshToken'.",
      "Because cookies are marked httpOnly, client-side JavaScript cannot read them, protecting your session from token exfiltration via Cross-Site Scripting (XSS). When your access token expires, the backend automatically issues a fresh token using the refresh cookie.",
    ],
  },
  {
    id: "account-vehicle-garage",
    category: "Account",
    question: "How do I manage my saved vehicles in the garage?",
    answer: [
      "Once logged in as a customer, navigate to the 'Vehicles' tab in the customer dashboard. You can add new vehicles by specifying the make, model, year, and license plate number.",
      "Saved vehicles automatically appear in Step 1 of the roadside assistance wizard, allowing you to select your vehicle with a single click rather than retyping details during an emergency.",
    ],
    links: [{ label: "View Customer Vehicles", href: "/customer/vehicles" }],
  },

  // Category: Requests
  {
    id: "requests-wizard-steps",
    category: "Requests",
    question: "How do I create a new emergency breakdown request?",
    answer: [
      "Breakdown requests are submitted through a streamlined 3-step wizard accessible from '/customer/requests/new':",
    ],
    list: [
      "Step 1 (Vehicle): Select a vehicle from your saved garage or opt to proceed without a vehicle record.",
      "Step 2 (Location): Pinpoint your breakdown coordinates using device GPS, manual map pin, or the 'Use demo location (Dhaka)' shortcut.",
      "Step 3 (Problem): Describe the issue (at least 10 characters), select priority (NORMAL or HIGH), and optionally attach breakdown photos.",
    ],
    links: [{ label: "Create Service Request", href: "/customer/requests/new" }],
  },
  {
    id: "requests-cancel-policy",
    category: "Requests",
    question: "What are the rules and deadlines for cancelling a request?",
    answer: [
      "Customers can cancel a service request while it is in PENDING, SEARCHING, ASSIGNED, EN_ROUTE, or ARRIVED status by clicking the 'Cancel Request' button on the request details page.",
      "Critical cutoff: Once the mechanic begins active repair work and shifts status to IN_PROGRESS or COMPLETED, cancellation is permanently locked to protect technician labor already invested in the vehicle.",
    ],
  },
  {
    id: "requests-photo-limits",
    category: "Requests",
    question: "What are the accepted image formats and file size limits for damage photos?",
    answer: [
      "Customers can upload up to 5 photos per request. Uploaded files must be in JPG, JPEG, PNG, or WEBP format and cannot exceed 5MB per file.",
      "Images are processed through multipart form handling and hosted securely on Cloudinary. High-resolution photos assist responding mechanics in preparing the correct replacement parts before arrival.",
    ],
  },
  {
    id: "requests-status-lifecycle",
    category: "Requests",
    question: "What is the complete status lifecycle of a service request?",
    answer: [
      "A request advances through clearly defined chronological phases:",
    ],
    list: [
      "PENDING: Request created and awaiting mechanic discovery or dispatch.",
      "ASSIGNED: A specific nearby mechanic has accepted or been chosen for the job.",
      "EN_ROUTE: The technician has departed and is traveling to your coordinates.",
      "ARRIVED: The technician is on site and beginning vehicle inspection.",
      "IN_PROGRESS: Active mechanical or electrical repair work is underway (cancellation locked).",
      "COMPLETED: Repair completed, final invoice issued, ready for test payment.",
      "CANCELLED: Customer cancelled before repair commenced, with optional cancellation note.",
    ],
    links: [{ label: "View Your Requests", href: "/customer/requests" }],
  },

  // Category: Payments
  {
    id: "payments-sandbox-mode",
    category: "Payments",
    question: "Does payment processing involve real money or live credit cards?",
    answer: [
      "No. All payment processing on RoadResQ operates through SSLCommerz in sandbox test mode. Real credit cards, bank accounts, or bKash/Nagad wallets are never billed.",
      "When directed to the SSLCommerz hosted gateway, select any simulated payment method (e.g. Test Visa, Master, or bKash Sandbox) and use mock credentials. The gateway will simulate approval and redirect back to your RoadResQ invoice with verified payment status.",
    ],
  },
  {
    id: "payments-failed-flow",
    category: "Payments",
    question: "What happens if a payment fails or encounters a gateway error?",
    answer: [
      "If a transaction fails at the payment gateway, SSLCommerz redirects the session to '/payment/fail'. The payment attempt is logged as FAILED in the backend database.",
      "Crucially, the associated service request invoice remains in PENDING status. The customer is never locked out and can navigate back to the request details page to initiate a fresh payment attempt whenever ready.",
    ],
  },
  {
    id: "payments-cancelled-flow",
    category: "Payments",
    question: "What happens if I cancel during the checkout screen?",
    answer: [
      "If you click 'Cancel' or navigate back while on the SSLCommerz gateway portal, you will be redirected to '/payment/cancel'.",
      "Your service request and completed work invoice are completely preserved. The request status remains unpaid and you can resume checkout at your convenience.",
    ],
  },
  {
    id: "payments-invoice-breakdown",
    category: "Payments",
    question: "How is the total invoice calculated and what is the parts price freeze?",
    answer: [
      "Each invoice reflects two transparent cost components: a fixed labor charge set by the technician plus the line-item cost of any spare parts installed.",
      "When a mechanic logs replacement parts (e.g. spark plugs, brake pads, drive belts), the unit price is permanently frozen at the exact timestamp of use, ensuring customers are protected from retrospective price modifications.",
    ],
  },

  // Category: Mechanics
  {
    id: "mechanics-discovery-radius",
    category: "Mechanics",
    question: "How does nearby mechanic discovery and distance calculation work?",
    answer: [
      "When you initiate a breakdown request, our backend queries available mechanics whose profiles include verified location coordinates. Using geospatial distance calculations, mechanics are ranked by physical proximity in kilometers from your breakdown latitude and longitude.",
      "Customers can expand the discovery radius (from 5km up to 50km) and review each mechanic's average rating, total completed jobs, and years of experience before making an assignment.",
    ],
    links: [{ label: "Browse Available Mechanics", href: "/mechanics" }],
  },
  {
    id: "mechanics-ratings-reviews",
    category: "Mechanics",
    question: "How are mechanic ratings and job counts verified?",
    answer: [
      "RoadResQ mechanics build their public profiles strictly through verified job completions. Customers can only rate and review a mechanic after an invoice is fully paid.",
      "A review consists of a 1-to-5 star rating and optional feedback. The system recalculates the mechanic's composite rating average and increments their 'completed jobs' counter automatically.",
    ],
  },
  {
    id: "mechanics-inventory-parts",
    category: "Mechanics",
    question: "How do mechanics manage inventory and attach parts to customer requests?",
    answer: [
      "Mechanics maintain a digital inventory in their dashboard, logging part names, manufacturer part numbers, stock quantities, and unit pricing in BDT.",
      "During an ongoing repair (IN_PROGRESS status), the mechanic can select items from their verified inventory and add them directly to the active request invoice, instantly updating the customer's live invoice view.",
    ],
  },
];

const CATEGORIES = ["All", "Account", "Requests", "Payments", "Mechanics"] as const;

export function SupportHubClient() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<(typeof CATEGORIES)[number]>("All");

  const filteredTopics = React.useMemo(() => {
    return TROUBLESHOOTING_TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === "All" || topic.category === selectedCategory;

      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const matchesText =
        topic.question.toLowerCase().includes(q) ||
        topic.answer.some((p) => p.toLowerCase().includes(q)) ||
        (topic.list && topic.list.some((item) => item.toLowerCase().includes(q)));

      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-10">
      {/* Demo Environment Quick-Tips Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 text-primary font-bold text-base">
          <MapPin className="h-5 w-5 shrink-0" />
          <span>Demo Environment Quick-Start Guide</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          RoadResQ is a functional portfolio and demonstration platform. Use these built-in test utilities to explore all customer and mechanic workflows:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              One-Click Demo Logins
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use the <span className="font-semibold text-foreground">&quot;Customer&quot;</span>, <span className="font-semibold text-foreground">&quot;Mechanic&quot;</span>, or <span className="font-semibold text-foreground">&quot;Admin&quot;</span> quick buttons on the login page to skip manual credential entry.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Dhaka Demo Location Tip
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seeded mechanics reside in Dhaka (lat: <span className="font-mono text-foreground font-medium">23.8103</span>, lng: <span className="font-mono text-foreground font-medium">90.4125</span>). In the request wizard, click <span className="font-semibold text-foreground">&quot;Use demo location (Dhaka)&quot;</span> to instantly view nearby mechanics.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Chips */}
      <section id="troubleshooting" className="scroll-m-24 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Troubleshooting Knowledge Base
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search real application workflows, limits, cancellation rules, and payment lifecycles.
            </p>
          </div>
          <span className="text-xs text-muted-foreground self-start sm:self-auto">
            Showing {filteredTopics.length} of {TROUBLESHOOTING_TOPICS.length} topics
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search troubleshooting questions, e.g. cancellation, photo limits, test cards..."
            className="pl-10 pr-10 h-11 rounded-xl bg-card border-border text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const count =
              category === "All"
                ? TROUBLESHOOTING_TOPICS.length
                : TROUBLESHOOTING_TOPICS.filter((t) => t.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Accordion Topics List */}
      <section className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No matching topics found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try adjusting your keywords or clearing the category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {filteredTopics.map((topic) => (
              <AccordionItem key={topic.id} value={topic.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0",
                        topic.category === "Account" && "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5",
                        topic.category === "Requests" && "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5",
                        topic.category === "Payments" && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
                        topic.category === "Mechanics" && "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                      )}
                    >
                      {topic.category}
                    </Badge>
                    <span className="text-sm sm:text-base font-semibold text-foreground">
                      {topic.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {topic.answer.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}

                    {topic.list && (
                      <ul className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 mt-2 text-xs sm:text-sm text-foreground">
                        {topic.list.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {topic.links && topic.links.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        {topic.links.map((link) => (
                          <Link key={link.href} href={link.href}>
                            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs h-8">
                              <span>{link.label}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Helpful Links Grid (FAQ and How It Works) */}
      <section id="additional-resources" className="scroll-m-24 space-y-4 pt-4 border-t border-border">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Platform Guides & Documentation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/faq" className="group block">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-sm space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Frequently Asked Questions
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review concise answers to high-frequency platform questions, billing rules, and technician assignments.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Browse FAQ</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          <Link href="/how-it-works" className="group block">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-sm space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  How RoadResQ Works
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Understand the full operational workflow from breakdown distress signal to live mechanic dispatch and invoice settlement.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-primary gap-1">
                <span>View System Flow</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Direct Contact & Inquiries (No ticket form) */}
      <section id="contact-developer" className="scroll-m-24 rounded-xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Direct Developer Contact
            </h3>
            <p className="text-xs text-muted-foreground">
              Connect with Tasif Hossan regarding the architecture, technical questions, or codebase review.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Because RoadResQ is an independent demonstration platform, there is no automated support ticket ticketing queue. For technical queries, bug reports, or discussion regarding the stack, reach out directly:
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          {siteConfig.contactEmail && (
            <a href={`mailto:${siteConfig.contactEmail}`}>
              <Button className="rounded-xl gap-2 text-xs">
                <Mail className="h-3.5 w-3.5" />
                <span>{siteConfig.contactEmail}</span>
              </Button>
            </a>
          )}
          <a
            href={siteConfig.links.portfolio}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="rounded-xl text-xs gap-1.5">
              <span>Developer Portfolio</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
          <a
            href={siteConfig.links.githubProfile}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="rounded-xl text-xs gap-1.5">
              <span>GitHub Profile</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
