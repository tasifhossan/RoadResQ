import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUp, FileText, AlertTriangle, CreditCard, CheckCircle2, Users, Cpu, ShieldAlert, RefreshCw, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | RoadResQ",
  description:
    "Terms and conditions governing the use and evaluation of the RoadResQ emergency roadside demonstration platform.",
};

interface TermsSection {
  id: string;
  title: string;
  icon: typeof FileText;
  content: string[];
  list?: string[];
}

const SECTIONS: TermsSection[] = [
  {
    id: "demo-notice",
    title: "1. Demonstration Platform Notice",
    icon: AlertTriangle,
    content: [
      "RoadResQ is an independent software engineering project developed by Tasif Hossan to demonstrate end-to-end full-stack emergency dispatch, location matching, and automated invoicing architecture.",
      "By accessing or registering an account on RoadResQ, you acknowledge and agree that the software is provided solely for educational, evaluation, and portfolio demonstration purposes. It does not represent an incorporated commercial roadside breakdown service or licensed dispatch agency.",
    ],
  },
  {
    id: "test-payments",
    title: "2. Payments in Test Mode Only",
    icon: CreditCard,
    content: [
      "All financial interactions, invoices, and checkout flows on RoadResQ operate exclusively within the SSLCommerz sandbox testing gateway. No actual monetary debits, bank transfers, or live credit card transactions take place.",
      "Users should only use simulated test card credentials or demo mobile banking accounts provided in platform documentation. Any attempt to use genuine credit card numbers or real payment instruments is unnecessary and strictly discouraged.",
    ],
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use Policy",
    icon: CheckCircle2,
    content: [
      "RoadResQ is designed to be explored, tested, and evaluated by reviewers, prospective employers, and developers. When interacting with the application, you agree to:",
    ],
    list: [
      "Use the platform solely for lawful evaluation and testing of vehicle roadside features.",
      "Refrain from transmitting malicious scripts, automated bot scrapers, or denial-of-service traffic.",
      "Avoid uploading offensive, fraudulent, or copyrighted imagery when submitting test breakdown photos.",
      "Never submit real confidential personal identifiers or sensitive financial information into any form field.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "4. Customer & Mechanic Roles in the Demo",
    icon: Users,
    content: [
      "To preserve a high-quality demonstration experience for all users evaluating the system, users in simulated roles agree to observe the core operational constraints:",
    ],
    list: [
      "Customer accounts: Submit realistic simulated vehicle details and adhere to request cancellation boundaries (a customer can cancel their own request while it is PENDING, SEARCHING or ASSIGNED. Once the mechanic is EN_ROUTE, ARRIVED or IN_PROGRESS only the assigned mechanic can cancel. COMPLETED requests cannot be cancelled).",
      "Mechanic accounts: Maintain realistic test inventory records, log transparent labor charges, and advance job statuses systematically to test live status synchronization.",
      "Admin accounts: Exercise administrative privileges solely to evaluate platform moderation, spare parts management, and audit logs without corrupting shared seed data.",
    ],
  },
  {
    id: "ai-disclaimer",
    title: "5. AI Diagnostic Suggestions Disclaimer",
    icon: Cpu,
    content: [
      "The AI assistant sends the text you type to Google's Gemini API to provide informational triage suggestions.",
      "AI suggestions do not constitute professional mechanical advice or safety assessments. Never rely on automated suggestions to diagnose high-risk mechanical failures on actual operating motor vehicles.",
    ],
  },
  {
    id: "availability",
    title: "6. Platform Availability & Disclaimers",
    icon: ShieldAlert,
    content: [
      "The RoadResQ web application, backend API, and real-time socket connections are provided on an 'as is' and 'as available' basis without warranties of any kind, whether express or implied.",
      "The developer does not guarantee continuous, uninterrupted server uptime or defect-free execution. Test databases, user accounts, and submitted service requests may be purged or reset without prior warning during development cycles.",
    ],
  },
  {
    id: "modifications",
    title: "7. Modifications to the Terms",
    icon: RefreshCw,
    content: [
      "The developer reserves the right to amend, update, or revise these terms at any time as new technical modules, third-party APIs, or cloud infrastructure are incorporated into the project.",
      "Continued usage of RoadResQ following any modifications constitutes acceptance of the revised terms. The effective revision date will always be displayed at the top of this document.",
    ],
  },
  {
    id: "contact-information",
    title: "8. Inquiries & Developer Contact",
    icon: Mail,
    content: [
      "If you have questions regarding these terms, platform capabilities, or would like to discuss the underlying software architecture, feel free to reach out directly:",
    ],
  },
];

export default function TermsPage() {
  return (
    <div id="top" className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Header & Breadcrumb */}
      <div className="mb-8 space-y-4 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold text-xs border-primary/30 text-primary bg-primary/5">
            Operational Guidelines
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">Last updated: October 19, 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Terms of Service
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
          Rules, usage limitations, and demonstration notices governing interactions with the RoadResQ emergency platform.
        </p>
      </div>

      {/* Main Grid: Content (8 cols) + Sticky Table of Contents (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 space-y-8">
          {SECTIONS.map((section) => {
            const IconComponent = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-m-24 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}

                  {section.list && (
                    <ul className="rounded-xl border border-border/60 bg-muted/30 p-4 sm:p-5 space-y-2 mt-3 text-sm text-foreground">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {section.id === "contact-information" && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {siteConfig.contactEmail && (
                      <a href={`mailto:${siteConfig.contactEmail}`}>
                        <Button className="rounded-xl gap-2 text-xs">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email Developer</span>
                        </Button>
                      </a>
                    )}
                    <a
                      href={siteConfig.links.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="rounded-xl text-xs">
                        GitHub Profile
                      </Button>
                    </a>
                    <a
                      href={siteConfig.links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="rounded-xl text-xs">
                        Developer Portfolio
                      </Button>
                    </a>
                  </div>
                )}
              </section>
            );
          })}

          {/* Bottom Back-to-Top and Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <span>RoadResQ Terms of Service</span>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4 font-medium"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Back to Top</span>
            </a>
          </div>
        </main>

        {/* Sticky Desktop Table of Contents */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-foreground border-b border-border pb-3">
              On This Page
            </h3>
            <nav className="space-y-1 text-xs">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-muted/50 truncate"
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Questions or Concerns?</p>
              <p>
                Read our data handling commitments in the{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="pt-2">
              <a
                href="#top"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUp className="h-3 w-3" />
                <span>Return to Top</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
