import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Wrench,
  Clock,
  Calendar,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { getPublicMechanicByIdServer } from "@/lib/api/public";
import { PublicMechanicDetail } from "@/lib/types/public";
import { MechanicAvatar } from "@/components/mechanics/mechanic-avatar";
import { MechanicCard } from "@/components/mechanics/mechanic-card";
import { SideHelpCard } from "@/components/mechanics/side-help-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getPublicMechanicByIdServer(id);
    const mechanic: PublicMechanicDetail = data.mechanic || data;
    const isPng = Boolean(mechanic.avatarUrl?.toLowerCase().endsWith(".png"));

    const description =
      mechanic.bio && mechanic.bio.trim().length > 0
        ? mechanic.bio.length > 160
          ? `${mechanic.bio.substring(0, 157)}...`
          : mechanic.bio
        : `View ratings, skills, and availability for certified mechanic ${mechanic.name} on RoadResQ.`;

    return {
      title: `${mechanic.name} - Certified Mechanic | RoadResQ`,
      description,
      openGraph: {
        title: `${mechanic.name} - Certified Mechanic | RoadResQ`,
        description,
        images: isPng && mechanic.avatarUrl ? [mechanic.avatarUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Mechanic Profile | RoadResQ",
      description: "View certified mechanic profile on RoadResQ.",
    };
  }
}

export default async function MechanicDetailPage({ params }: PageProps) {
  const { id } = await params;

  let mechanic: PublicMechanicDetail;

  try {
    const data = await getPublicMechanicByIdServer(id);
    mechanic = data.mechanic || data;
    if (!mechanic || !mechanic.name) {
      notFound();
    }
  } catch {
    notFound();
  }

  const memberSinceFormatted = mechanic.memberSince
    ? new Date(mechanic.memberSince).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const hasReviews = mechanic.ratingSummary.count > 0;
  const distribution = mechanic.ratingSummary.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalReviews = mechanic.ratingSummary.count || 1;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Breadcrumbs: Home > Mechanics > <name> */}
      <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
          </li>
          <li>
            <Link href="/mechanics" className="hover:text-foreground transition-colors">
              Mechanics
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
          </li>
          <li className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {mechanic.name}
          </li>
        </ol>
      </nav>

      {/* 2. Header Profile Card */}
      <section className="card-base rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <MechanicAvatar
            src={mechanic.avatarUrl}
            name={mechanic.name}
            className="size-24 sm:size-28 md:size-32"
          />

          <div className="space-y-3 flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {mechanic.name}
                </h1>
                <StatusBadge status={mechanic.availability} />
              </div>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              {/* Rating or New badge */}
              {hasReviews ? (
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-500" />
                  <span>{mechanic.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">
                    ({mechanic.ratingSummary.count} reviews)
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  New Mechanic
                </span>
              )}

              {/* City */}
              {mechanic.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-muted-foreground/80 shrink-0" />
                  <span>{mechanic.city}</span>
                </div>
              )}

              {/* Completed Jobs */}
              <div className="flex items-center gap-1.5">
                <Wrench className="size-4 text-muted-foreground/80 shrink-0" />
                <span>{mechanic.totalJobs} completed jobs</span>
              </div>

              {/* Years of Experience */}
              {mechanic.yearsExperience !== null && mechanic.yearsExperience !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-muted-foreground/80 shrink-0" />
                  <span>{mechanic.yearsExperience} years experience</span>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-muted-foreground/80 shrink-0" />
                <span>Joined {memberSinceFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Main Details (2 cols) + Sticky Side Help Card (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3. Overview: Full Bio */}
          <section className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Overview</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {mechanic.bio ||
                "This certified technician has not provided an extended bio yet. They are active on the platform and ready to handle emergency roadside dispatch requests."}
            </p>
          </section>

          {/* 4. Key Information: Definition List */}
          <section className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Key Information</h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills & Services
                </dt>
                <dd className="flex flex-wrap gap-1.5 pt-1">
                  {mechanic.skills && mechanic.skills.length > 0 ? (
                    mechanic.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">General roadside assistance</span>
                  )}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Years of Experience
                </dt>
                <dd className="font-semibold text-foreground pt-1">
                  {mechanic.yearsExperience !== null && mechanic.yearsExperience !== undefined
                    ? `${mechanic.yearsExperience} Years`
                    : "Not specified"}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Service City
                </dt>
                <dd className="font-semibold text-foreground pt-1">
                  {mechanic.city || "Available across operational regions"}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability Status
                </dt>
                <dd className="pt-1">
                  <StatusBadge status={mechanic.availability} />
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Platform Member Since
                </dt>
                <dd className="font-semibold text-foreground pt-1">{memberSinceFormatted}</dd>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Completed Service Jobs
                </dt>
                <dd className="font-semibold text-foreground pt-1">
                  {mechanic.totalJobs} Verified Services
                </dd>
              </div>
            </dl>
          </section>

          {/* 5. Reviews and Ratings */}
          <section className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Reviews & Ratings
              </h2>
              <span className="text-xs text-muted-foreground">
                {mechanic.ratingSummary.count} verified customer review
                {mechanic.ratingSummary.count === 1 ? "" : "s"}
              </span>
            </div>

            {hasReviews ? (
              <div className="space-y-6">
                {/* Rating Breakdown Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-4 rounded-xl border border-border bg-muted/20">
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-4xl font-extrabold tracking-tight text-foreground">
                      {mechanic.ratingSummary.average.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-4 ${
                            star <= Math.round(mechanic.ratingSummary.average)
                              ? "fill-amber-400 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on {mechanic.ratingSummary.count} review
                      {mechanic.ratingSummary.count === 1 ? "" : "s"}
                    </p>
                  </div>

                  {/* 1-to-5 Horizontal Bars from ratingSummary.distribution */}
                  <div className="sm:col-span-2 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = distribution[star] || 0;
                      const percentage = Math.round((count / totalReviews) * 100);
                      return (
                        <div key={star} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-medium text-muted-foreground flex items-center gap-1">
                            <span>{star}</span>
                            <Star className="size-3 fill-amber-400 text-amber-500" />
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground font-mono">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Reviews List */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Recent Customer Feedback
                  </h3>

                  <div className="divide-y divide-border/60">
                    {mechanic.reviews.map((rev, index) => {
                      const reviewDate = rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent";

                      return (
                        <article key={index} className="py-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground text-sm">
                              {rev.reviewerName}
                            </span>
                            <span className="text-muted-foreground">{reviewDate}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= rev.rating
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rev.comment}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquare className="size-6 text-muted-foreground" />}
                title="No customer reviews yet"
                description="This mechanic has completed assigned service jobs, but no customers have left written review comments yet."
              />
            )}
          </section>
        </div>

        {/* 7. Sticky Side Card: "Need roadside help?" */}
        <aside className="lg:sticky lg:top-24 space-y-6">
          <SideHelpCard />
        </aside>
      </div>

      {/* 6. Related Mechanics */}
      {mechanic.related && mechanic.related.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Similar Mechanics
            </h2>
            <p className="text-sm text-muted-foreground">
              Other certified technicians specializing in similar roadside emergency services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mechanic.related.slice(0, 4).map((relatedMechanic) => (
              <MechanicCard key={relatedMechanic.id} mechanic={relatedMechanic} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
