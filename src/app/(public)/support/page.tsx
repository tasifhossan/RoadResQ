import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupportHubClient } from "@/components/support/support-hub-client";

export const metadata: Metadata = {
  title: "Support Center | RoadResQ Help & Troubleshooting",
  description:
    "Troubleshooting guides, demo account instructions, cancellation rules, payment test-mode behavior, and developer contact for RoadResQ.",
};

const TOC_SECTIONS = [
  { id: "troubleshooting", label: "Troubleshooting Knowledge Base" },
  { id: "additional-resources", label: "Platform Guides & Documentation" },
  { id: "contact-developer", label: "Direct Developer Contact" },
];

export default function SupportPage() {
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
            Support & Troubleshooting
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">Last updated: October 19, 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Support Center
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
          Explore technical solutions, understand app lifecycles, and learn how to navigate the RoadResQ emergency platform demo.
        </p>
      </div>

      {/* Main Grid: Content (8 cols) + Sticky Table of Contents (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 space-y-8">
          <SupportHubClient />

          {/* Bottom Back-to-Top and Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <span>RoadResQ Help Hub</span>
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
              Help Center Directory
            </h3>
            <nav className="space-y-1 text-xs">
              {TOC_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-muted/50 truncate"
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Legal & Privacy Notices</p>
              <p>
                Review our commitments in the{" "}
                <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                  Terms of Service
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
