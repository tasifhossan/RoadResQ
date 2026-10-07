import { env } from "@/lib/env";

export const siteConfig = {
  name: "RoadResQ",
  title: "RoadResQ - On-Demand Roadside Emergency Platform",
  description:
    "Full-stack emergency roadside assistance platform connecting stranded motorists with nearby verified mechanics, real-time status updates, transparent invoices, and SSLCommerz test payments.",
  url: env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  links: {
    githubProfile: "https://github.com/tasifhossan",
    backendRepo: "https://github.com/tasifhossan/RoadResQ-backend",
    frontendRepo: "https://github.com/tasifhossan/RoadResQ",
    portfolio: "https://tasif-portfolio.vercel.app",
    issues: "https://github.com/tasifhossan/RoadResQ/issues",
    apiDocs: "https://road-res-q-backend.vercel.app/api/v1",
  },
} as const;

export type SiteConfig = typeof siteConfig;
