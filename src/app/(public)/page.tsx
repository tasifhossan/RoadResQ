import { Metadata } from "next";
import Link from "next/link";
import {
  Wrench,
  Zap,
  CircleDot,
  Disc,
  Activity,
  Snowflake,
  Cpu,
  Truck,
  Key,
  Cog,
  Fuel,
  ArrowRight,
  MapPin,
  Search,
  Navigation,
  CreditCard,
  User,
  Shield,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  getPublicMechanicsServer,
  getPublicStatsServer,
  getPublicReviewsServer,
} from "@/lib/api/public";
import { getAllBlogPosts } from "@/content/blog/posts";
import { HeroSlider } from "@/components/home/hero-slider";
import { StatsCounter } from "@/components/home/stats-counter";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { DemoCtaButtons } from "@/components/home/demo-cta-buttons";
import { MechanicCard } from "@/components/mechanics/mechanic-card";
import { BlogCard } from "@/components/blog/blog-card";
import {
  PublicMechanicsResponse,
  PublicStats,
  PublicReviewsResponse,
  PublicMechanicListItem,
} from "@/lib/types/public";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export const metadata: Metadata = {
  title: "On-Demand Roadside Emergency Assistance Platform | RoadResQ",
  description:
    "Connect stranded drivers with nearby mechanics in real-time. Live distance-based dispatch, transparent frozen parts pricing, itemized invoices, and SSLCommerz test payments.",
};

// Skill icon mapper for Section 2
function getSkillIcon(skill: string) {
  const s = skill.toLowerCase();
  if (s.includes("battery")) return Zap;
  if (s.includes("tire")) return CircleDot;
  if (s.includes("brake")) return Disc;
  if (s.includes("engine")) return Activity;
  if (s.includes("ac")) return Snowflake;
  if (s.includes("electrical")) return Cpu;
  if (s.includes("tow")) return Truck;
  if (s.includes("lock")) return Key;
  if (s.includes("transmission")) return Cog;
  if (s.includes("fuel")) return Fuel;
  return Wrench;
}

// 6 FAQ items reused from /faq
const HOME_FAQ_ITEMS = [
  {
    value: "faq-1",
    question: "How are mechanics discovered and chosen for a breakdown request?",
    answer:
      "The customer chooses the search radius (5 to 50 km) and selects a mechanic from the nearby list based on rating and distance. A mechanic's job count is the number of COMPLETED requests, and ratings come from reviews left on completed jobs.",
  },
  {
    value: "faq-2",
    question: "Can a service request be cancelled, and until when?",
    answer:
      "A customer can cancel their own request while it is PENDING, SEARCHING or ASSIGNED. Once the mechanic is EN_ROUTE, ARRIVED or IN_PROGRESS only the assigned mechanic can cancel. COMPLETED requests cannot be cancelled.",
  },
  {
    value: "faq-3",
    question: "How is the final invoice price calculated?",
    answer:
      "The total invoice amount is the sum of the fixed labor fee plus the total cost of spare parts used. When a mechanic logs replacement parts from their inventory during repair, unit prices are permanently frozen at the exact price-at-use timestamp.",
  },
  {
    value: "faq-4",
    question: "What are the accepted photo upload types and file count limits?",
    answer:
      "Customers can attach up to 5 images when creating or updating a service request. Allowed file extensions are JPG, JPEG, PNG, and WEBP with a maximum file size limit of 5MB per photo, uploaded securely via Cloudinary.",
  },
  {
    value: "faq-5",
    question: "How does payment processing work on RoadResQ?",
    answer:
      "Digital payments are processed via the SSLCommerz payment gateway operating safely in sandbox test mode. Real credit cards are never charged, and test transactions generate authentic gateway callbacks and invoice state updates.",
  },
  {
    value: "faq-6",
    question: "What happens if an SSLCommerz payment fails or is cancelled?",
    answer:
      "If a payment attempt fails or is cancelled on the SSLCommerz gateway interface, the transaction is marked FAILED or CANCELLED. The invoice remains in PENDING status so the customer can retry payment whenever ready.",
  },
];

export default async function HomePage() {
  // Gracefully fetch live data from backend with fallback error handling
  let mechanicsData: PublicMechanicsResponse | null = null;
  let statsData: PublicStats | null = null;
  let topMechanics: PublicMechanicListItem[] = [];
  let reviewsData: PublicReviewsResponse | null = null;

  try {
    mechanicsData = await getPublicMechanicsServer({
      page: 1,
      limit: 1,
      sortBy: "rating",
      sortOrder: "desc",
    });
  } catch {
    mechanicsData = null;
  }

  try {
    statsData = await getPublicStatsServer();
  } catch {
    statsData = null;
  }

  try {
    const topRes = await getPublicMechanicsServer({
      page: 1,
      limit: 4,
      minRating: 4,
      minJobs: 1,
      sortBy: "rating",
      sortOrder: "desc",
    });
    topMechanics = topRes.items || [];
  } catch {
    topMechanics = [];
  }

  try {
    reviewsData = await getPublicReviewsServer({ limit: 8 });
  } catch {
    reviewsData = null;
  }

  // 3 latest blog posts from local content
  const latestArticles = getAllBlogPosts().slice(0, 3);

  // Extract real facets from mechanicsData
  const skillFacets = mechanicsData?.facets?.skills || [];
  const cityFacets = mechanicsData?.facets?.cities || [];
  const reviews = reviewsData?.reviews || reviewsData?.items || [];

  return (
    <div className="flex flex-col min-h-full">
      {/* SECTION 1: HERO */}
      <HeroSlider />

      {/* SECTION 2: SERVICE CATEGORIES */}
      {skillFacets.length > 0 && (
        <section id="services" className="scroll-m-24 py-12 md:py-16 border-b border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5 mb-1.5">
                  Service Skills
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Roadside Service Categories
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Discover mechanics specialized in specific breakdown repairs across Bangladesh.
                </p>
              </div>
              <Link href="/mechanics">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <span>Explore all skills</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {skillFacets.slice(0, 8).map((skill) => {
                const IconComponent = getSkillIcon(skill.value);
                return (
                  <Link
                    key={skill.value}
                    href={`/mechanics?skill=${encodeURIComponent(skill.value)}`}
                    className="group"
                  >
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary hover:shadow-sm flex flex-col justify-between h-full space-y-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {skill.value}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {skill.count} {skill.count === 1 ? "mechanic" : "mechanics"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: LIVE STATISTICS */}
      {statsData && <StatsCounter stats={statsData} />}

      {/* SECTION 4: TOP-RATED MECHANICS */}
      {topMechanics.length > 0 && (
        <section id="top-mechanics" className="scroll-m-24 py-12 md:py-16 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-orange-500/30 text-orange-700 dark:text-orange-400 bg-orange-500/5 mb-1.5">
                  Customer Ratings
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Top-Rated Mechanics
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Experienced roadside technicians with high customer review ratings and completed jobs.
                </p>
              </div>
              <Link href="/mechanics">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <span>View all mechanics</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topMechanics.map((mechanic) => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: HOW IT WORKS */}
      <section id="how-it-works" className="scroll-m-24 py-12 md:py-16 border-b border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5">
              4-Step Process
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How RoadResQ Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A transparent, dependable workflow connecting you with local roadside assistance when trouble strikes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-primary">01. Pinpoint</span>
                <h3 className="text-base font-bold text-foreground mt-1">Share Location</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Use device GPS coordinates or the Dhaka demo shortcut. Describe your mechanical issue and attach breakdown photos.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-primary">02. Discover</span>
                <h3 className="text-base font-bold text-foreground mt-1">Choose Technician</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Browse nearby mechanics ranked by real distance and reviews. Choose your technician and confirm assignment.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-primary">03. Track</span>
                <h3 className="text-base font-bold text-foreground mt-1">Live Rescue Status</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Watch live milestones update as your mechanic travels en route, arrives on site, and begins hands-on repair.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-primary">04. Settle</span>
                <h3 className="text-base font-bold text-foreground mt-1">Transparent Invoice</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Review fixed labor fees and timestamp-locked spare parts, checkout through SSLCommerz sandbox, and submit a review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: BUILT FOR THREE ROLES */}
      <section id="roles" className="scroll-m-24 py-12 md:py-16 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5">
              Complete Ecosystem
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Built for Three Platform Roles
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tailored capabilities delivering smooth coordination between drivers, technicians, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Role */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">For Stranded Motorists</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Fast distress callouts with minimal input required on the road.
                </p>
                <ul className="space-y-2 text-xs text-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>3-step emergency request wizard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Saved garage with vehicle profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Live status tracking and history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Test checkout via SSLCommerz gateway</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl text-xs">
                    Motorist Access
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mechanic Role */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">For Roadside Mechanics</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Direct dispatch management, inventory control, and transparent billing.
                </p>
                <ul className="space-y-2 text-xs text-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Instant job assignment alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Status advancement: en route & arrived</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Digital parts inventory & price locking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Customer reviews & completed jobs</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full rounded-xl text-xs">
                    Mechanic Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admin Role */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">For Platform Administrators</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Full ecosystem moderation, parts catalog oversight, and audit logs.
                </p>
                <ul className="space-y-2 text-xs text-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>System-wide service request tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>Global spare parts catalog management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>User account moderation & role assignment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>Chronological administrative audit logs</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full rounded-xl text-xs">
                    Admin Console
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PLATFORM HIGHLIGHTS */}
      <section id="highlights" className="scroll-m-24 py-12 md:py-16 border-b border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5">
              Engineering Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Platform Architecture Highlights
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on live backend endpoints with strict data integrity and real-time synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Proximity Matching</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Geospatial distance computation in kilometers based on real GPS coordinates. Customers choose their search radius (5 to 50 km) and select a nearby mechanic.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Frozen Price Quotes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unit prices of replacement parts are locked permanently at the exact timestamp of use, preventing invoice inflation or retroactive changes.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Sandbox Payments</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Integrated SSLCommerz gateway in test mode supporting simulated card and mobile wallet callbacks with instant invoice settlement.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Star className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Reviews from Completed Jobs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Customer reviews and star ratings can only be submitted following job completion, ensuring genuine feedback from actual repairs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS (Scroll-Snap Carousel) */}
      {reviews.length > 0 && (
        <section id="testimonials" className="scroll-m-24 py-12 md:py-16 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 space-y-1">
              <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-orange-500/30 text-orange-700 dark:text-orange-400 bg-orange-500/5 mb-1.5">
                Customer Voices
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Customer Reviews
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Feedback submitted directly by motorists following completed and paid assistance requests.
              </p>
            </div>

            <ReviewsCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* SECTION 9: COVERAGE (Cities from Facets) */}
      {cityFacets.length > 0 && (
        <section id="coverage" className="scroll-m-24 py-12 md:py-16 border-b border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5 mb-1.5">
                  District Network
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Regional Service Coverage
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Active mechanics registered across major metropolitan districts and highway corridors in Bangladesh.
                </p>
              </div>
              <Link href="/mechanics">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <span>Browse by district</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {cityFacets.map((city) => (
                <Link
                  key={city.value}
                  href={`/mechanics?search=${encodeURIComponent(city.value)}`}
                  className="group"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-medium shadow-2xs">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{city.value}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                      {city.count}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: BLOG PREVIEW (3 Latest Guides) */}
      {latestArticles.length > 0 && (
        <section id="blog" className="scroll-m-24 py-12 md:py-16 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5 mb-1.5">
                  Roadside Safety Knowledge
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Latest Emergency Guides
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Practical, reliable advice on vehicle maintenance, overheating, flat tires, and monsoon driving.
                </p>
              </div>
              <Link href="/blog">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
                  <span>View all articles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 11: FAQ ACCORDION (6 Questions) */}
      <section id="faq" className="scroll-m-24 py-12 md:py-16 border-b border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-10 space-y-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5">
              Clear Answers
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Essential facts on mechanic discovery, cancellation boundaries, photo uploads, and sandbox payments.
            </p>
          </div>

          <Accordion type="single" defaultValue="faq-1" className="space-y-3">
            {HOME_FAQ_ITEMS.map((faq) => (
              <AccordionItem key={faq.value} value={faq.value}>
                <AccordionTrigger className="text-sm sm:text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <Link href="/faq">
              <Button variant="outline" className="rounded-xl text-xs gap-1.5">
                <span>View complete FAQ directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CALL-TO-ACTION BAND (3 Demo Login Buttons) */}
      <section id="cta" className="scroll-m-24 py-16 md:py-20 bg-gradient-to-b from-background via-card to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-6">
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-semibold border-primary/30 text-primary bg-primary/5">
            Instant Test Access
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Experience RoadResQ Today
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Test the end-to-end roadside dispatch experience immediately. Select any demo persona below to explore customer, mechanic, or administrator views:
          </p>

          <div className="pt-2">
            <DemoCtaButtons />
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/register" className="hover:text-foreground transition-colors underline underline-offset-4">
              Register custom account
            </Link>
            <span>•</span>
            <Link href="/how-it-works" className="hover:text-foreground transition-colors underline underline-offset-4">
              Learn how it works
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-foreground transition-colors underline underline-offset-4">
              Support center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
