import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Globe,
  Mail,
  Bug,
  KeyRound,
  ExternalLink,
  Code2,
  FileCode2,
  ArrowRight,
  MessageSquareCode,
  GitBranch,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Developer & Support | RoadResQ Demo Platform",
  description:
    "Reach out to the developer behind RoadResQ, report demo issues on GitHub, access project repositories, or test instant demo accounts.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-full py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary">
            Developer Links & Support
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Contact & Developer Links
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            RoadResQ is an open demonstration platform. Explore developer profiles, public source repositories, issue trackers, and demo login shortcuts below.
          </p>
        </div>

        {/* Optional Email Line (Shown ONLY if NEXT_PUBLIC_CONTACT_EMAIL is set) */}
        {siteConfig.contactEmail && (
          <div className="p-6 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Direct Email Contact</p>
                <p className="text-sm sm:text-base font-bold text-foreground">{siteConfig.contactEmail}</p>
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Send email
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Developer Connections Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquareCode className="h-5 w-5 text-primary" />
              Developer & Source Repositories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub Profile */}
            <a
              href={siteConfig.links.githubProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GitBranch className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  GitHub Profile
                </h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  github.com/tasifhossan
                </p>
              </div>
            </a>

            {/* Developer Portfolio */}
            <a
              href={siteConfig.links.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl border border-border/80 bg-card hover:border-accent/50 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Globe className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  Developer Portfolio
                </h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  tasif-portfolio.vercel.app
                </p>
              </div>
            </a>

            {/* Frontend Repo */}
            <a
              href={siteConfig.links.frontendRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Frontend Repository
                </h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  github.com/tasifhossan/RoadResQ
                </p>
              </div>
            </a>

            {/* Backend Repo */}
            <a
              href={siteConfig.links.backendRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl border border-border/80 bg-card hover:border-accent/50 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  Backend Repository
                </h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  github.com/tasifhossan/RoadResQ-backend
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Report a Problem & Demo Accounts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report an Issue Note */}
          <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Bug className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Report a Problem with the Demo</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Notice an issue, unexpected error, or edge-case behavior on the RoadResQ demo platform? Open a bug report directly on GitHub Issues.
              </p>
            </div>
            <a
              href={siteConfig.links.issues}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Open GitHub Issue
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Card>

          {/* Small Demo Accounts Card */}
          <Card className="rounded-3xl border-border/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Test Instant Demo Accounts</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Log in instantly as a Customer, Mechanic, or Admin using seeded demo credentials—no signup forms required.
              </p>
            </div>
            <Link href="/login" className="pt-2">
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl">
                Go to Demo Login
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
