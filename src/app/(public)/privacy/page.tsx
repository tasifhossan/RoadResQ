import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Shield, Lock, MapPin, Eye, Cpu, Database, CreditCard, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | RoadResQ",
  description:
    "Privacy policy and data handling transparency for the RoadResQ roadside emergency demonstration platform.",
};

interface PrivacySection {
  id: string;
  title: string;
  icon: typeof Shield;
  content: string[];
  list?: string[];
}

const SECTIONS: PrivacySection[] = [
  {
    id: "platform-notice",
    title: "1. Demonstration Platform Context",
    icon: Shield,
    content: [
      `RoadResQ is an engineering and portfolio demonstration platform ${siteConfig.developerName ? `operated by ${siteConfig.developerName}` : "operated by the RoadResQ developer"}. It is designed to demonstrate real-time geolocation matching, dispatch lifecycles, and test-mode payment flows.`,
      "The platform operates strictly in an evaluation capacity. While it replicates genuine production workflows, it is not an incorporated commercial entity. Personal information is handled with careful safeguards, but users should avoid uploading proprietary, sensitive, or high-risk private information.",
    ],
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    icon: Eye,
    content: [
      "When you interact with the RoadResQ web application, we collect only the data necessary to demonstrate roadside assistance coordination, user accounts, and billing workflows:",
    ],
    list: [
      "Account credentials: Name, email address, and phone number provided during manual registration.",
      "Google OAuth data: if you sign in with Google, we receive your name and email.",
      "Vehicle records: Vehicle make, model, manufacturing year, and license plate number added to your garage profile.",
      "Service coordinates: Exact GPS latitude and longitude captured when you place a breakdown request or search for mechanics.",
      "Damage and breakdown media: Visual breakdown photos attached to your service requests, stored on Cloudinary.",
      "Invoice and billing records: Transaction identifiers, currency amounts in BDT, and payment statuses processed via SSLCommerz sandbox.",
      "Customer reviews: Numeric star ratings (1 to 5) and written feedback comments submitted upon request completion.",
    ],
  },
  {
    id: "cookies-session",
    title: "3. Session Storage & Cookie Security",
    icon: Lock,
    content: [
      "RoadResQ utilizes session cookies named rrq_access and rrq_refresh (httpOnly) to manage user authentication sessions. When you log in, our backend issues JSON Web Tokens delivered exclusively through Set-Cookie response headers.",
      "Because these session cookies are flagged as httpOnly, they cannot be accessed, read, or modified by client-side JavaScript. This architectural design effectively protects your session from Cross-Site Scripting (XSS) interception. Secure flags ensure cookies are transmitted solely over HTTPS in production environments.",
    ],
  },
  {
    id: "location-usage",
    title: "4. Precise Location & Geolocation Practices",
    icon: MapPin,
    content: [
      "RoadResQ does not track your location in the background or monitor your movements continuously. Geolocation coordinates (latitude and longitude) are accessed strictly on demand in two scenarios:",
    ],
    list: [
      "When you explicitly click 'Detect my location' or 'Use demo location (Dhaka)' during the 3-step breakdown request wizard.",
      "When you initiate a radius-based mechanic discovery search to view nearby service providers in your district.",
    ],
  },
  {
    id: "photos-cloudinary",
    title: "5. Damage Photos & Cloudinary Media Storage",
    icon: Database,
    content: [
      "When submitting a breakdown report, customers may attach up to five photographic images to document mechanical failure, tire wear, or body damage. Uploaded images are limited to 5MB each in JPG, JPEG, PNG, or WEBP format.",
      "Image files are transmitted to and hosted on Cloudinary under dedicated folders. Photos are accessible only through HTTPS URLs associated with your service request record so that assigned technicians can accurately inspect vehicle conditions before arrival.",
    ],
  },
  {
    id: "ai-diagnostics",
    title: "6. AI Diagnostics & Google Gemini API Notice",
    icon: Cpu,
    content: [
      "The AI assistant sends the text you type to Google's Gemini API to provide informational triage suggestions.",
      "Important notice: Do not enter private personal details, residential addresses, financial account numbers, or confidential identifiers into AI input fields. AI diagnostic suggestions are intended purely for informational triage and do not constitute professional mechanical or safety advice.",
    ],
  },
  {
    id: "payment-records",
    title: "7. Payment Records & SSLCommerz Sandbox",
    icon: CreditCard,
    content: [
      "All monetary transactions on RoadResQ operate through the SSLCommerz payment gateway in sandbox test mode. No actual financial debits, bank transfers, or credit card charges ever occur.",
      "When a test transaction completes, fails, or is cancelled, our backend records the test transaction reference ID, BDT amount, payment gateway status code, and timestamp to update invoice states. We never receive or store real credit card numbers or mobile banking PINs.",
    ],
  },
  {
    id: "demo-resets",
    title: "8. Demo Data Resets & Retention",
    icon: Database,
    content: [
      "Because RoadResQ is an active development and evaluation platform, the underlying database may be wiped, seeded, or reset periodically by the developer to maintain test consistency.",
      "You should not rely on RoadResQ for permanent archiving of vehicle service records or legal maintenance logs. Inactive test accounts and simulated requests may be purged without advance notice.",
    ],
  },
  {
    id: "user-rights-contact",
    title: "9. User Rights & Contacting the Developer",
    icon: Mail,
    content: [
      "You retain full ownership rights over your personal profile data. You may review your profile information, remove saved vehicles from your garage, or delete your account credentials at any time through the customer dashboard.",
      `For privacy inquiries, data deletion requests, or questions regarding the platform codebase and operational architecture, contact ${siteConfig.developerName ? `developer ${siteConfig.developerName}` : "the RoadResQ developer"} directly via the links below:`,
    ],
  },
];

export default function PrivacyPage() {
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
            Legal Transparency
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">Last updated: October 19, 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Privacy Policy
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
          A transparent, technical disclosure of how data is gathered, stored, and utilized within the RoadResQ roadside emergency demonstration environment.
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

                {section.id === "user-rights-contact" && (
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
            <span>RoadResQ Demonstration Platform</span>
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
              <p className="font-semibold text-foreground">Need Technical Help?</p>
              <p>
                Browse our comprehensive troubleshooting directory in the{" "}
                <Link href="/support" className="text-primary hover:underline underline-offset-4">
                  Support Center
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
