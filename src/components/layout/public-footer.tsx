import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Globe, Mail } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-sm text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary inline-block">
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Emergency roadside assistance platform connecting stranded motorists with nearby mechanics across Bangladesh with transparent invoices.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={siteConfig.links.githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="Developer Portfolio"
              >
                <Globe className="h-4 w-4" />
              </a>
              {siteConfig.links.linkedin && (
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Explore
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/assistant" className="hover:text-foreground transition-colors">
                  Breakdown Assistant
                </Link>
              </li>
              <li>
                <Link href="/mechanics" className="hover:text-foreground transition-colors">
                  Mechanics
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Contact
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              {siteConfig.contactEmail && (
                <li>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{siteConfig.contactEmail}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6 flex items-center justify-center text-xs text-muted-foreground">
          <p>© {currentYear} RoadResQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
