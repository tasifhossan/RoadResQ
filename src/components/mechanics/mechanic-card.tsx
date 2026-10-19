"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Wrench, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicMechanicListItem } from "@/lib/types/public";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface MechanicCardProps {
  mechanic: PublicMechanicListItem;
  className?: string;
}

/**
 * Extracts clean user initials from full name.
 * e.g. "Mohammad Rafiqul Islam" -> "MR"
 */
function getInitials(name: string): string {
  if (!name) return "M";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Shared Mechanic Card component adhering strictly to STN-7 design tokens:
 * - One shared card style (rounded-xl, border-border, shadow-sm, hover:shadow-md)
 * - Fixed layout ensuring identical dimensions across grid items
 * - Fixed aspect-ratio avatar with next/image, lazy loading, explicit sizes, and initials fallback
 * - 3-color availability badge mapping
 * - Rating with star, or "New" badge when no reviews/zero rating
 * - 40px mobile tap targets on action links
 */
export function MechanicCard({ mechanic, className }: MechanicCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const hasReviews = mechanic.rating > 0;
  const visibleSkills = mechanic.skills?.slice(0, 3) || [];
  const remainingSkills = (mechanic.skills?.length || 0) - visibleSkills.length;

  return (
    <div
      data-slot="mechanic-card"
      className={cn(
        "card-base group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-border/80",
        className
      )}
    >
      {/* Media area with fixed aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-muted/30">
        {mechanic.avatarUrl && !imageError ? (
          <Image
            src={mechanic.avatarUrl}
            alt={mechanic.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 via-muted/50 to-orange-500/10 text-2xl font-bold tracking-tight text-muted-foreground/80 select-none">
            {getInitials(mechanic.name)}
          </div>
        )}

        {/* Availability Badge (3-color mapping via StatusBadge) */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={mechanic.availability} />
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          {/* Title & Name */}
          <h3
            className="text-lg font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors"
            title={mechanic.name}
          >
            {mechanic.name}
          </h3>

          {/* 2-line clamped bio with consistent height */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {mechanic.bio || "Roadside technician ready to assist with emergency vehicle repairs."}
          </p>

          {/* Meta row: Rating, Completed Jobs, Years of Experience, City */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-1">
            {hasReviews ? (
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="size-3.5 fill-orange-400 text-orange-400" />
                <span>{mechanic.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                New
              </span>
            )}

            <div className="flex items-center gap-1" title="Completed jobs">
              <Wrench className="size-3 text-muted-foreground/70" />
              <span>{mechanic.totalJobs} jobs</span>
            </div>

            {mechanic.yearsExperience !== null && mechanic.yearsExperience !== undefined && (
              <div className="flex items-center gap-1" title="Years of experience">
                <Clock className="size-3 text-muted-foreground/70" />
                <span>{mechanic.yearsExperience}y exp</span>
              </div>
            )}

            {mechanic.city && (
              <div className="flex items-center gap-1 truncate max-w-[120px]" title={mechanic.city}>
                <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate">{mechanic.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills chips: up to 3 chips plus +N */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 min-h-[1.75rem]">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground/80"
            >
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground/90">
              +{remainingSkills}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Full-width button linking to /mechanics/[id] */}
      <div className="border-t border-border/60 bg-muted/20 p-4">
        <Link
          href={`/mechanics/${mechanic.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-xl")}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

/**
 * Skeleton component with identical dimensions to MechanicCard.
 */
export function MechanicCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="mechanic-card-skeleton"
      className={cn(
        "card-base flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* Media skeleton area matching aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content skeleton matching padding scale */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full rounded-sm" />
            <Skeleton className="h-3.5 w-4/5 rounded-sm" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-4 w-12 rounded-sm" />
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-4 w-14 rounded-sm" />
          </div>
        </div>

        {/* Skill chips skeleton */}
        <div className="flex items-center gap-1.5 pt-1">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>

      {/* Footer skeleton matching button layout */}
      <div className="border-t border-border/60 bg-muted/20 p-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export interface MechanicGridProps {
  mechanics?: PublicMechanicListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  variant?: "default" | "skeleton";
}

/**
 * MechanicGrid component rendering exactly 4 items per row on desktop (lg:grid-cols-4),
 * 2 items on tablet (sm:grid-cols-2), and 1 item on mobile (grid-cols-1) with gap-6.
 */
export function MechanicGrid({
  mechanics,
  isLoading = false,
  skeletonCount = 8,
  className,
  variant = "default",
}: MechanicGridProps) {
  const showSkeleton = isLoading || variant === "skeleton";

  if (showSkeleton) {
    return (
      <div
        data-slot="mechanic-grid-skeleton"
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MechanicCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      data-slot="mechanic-grid"
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {mechanics?.map((mechanic) => (
        <MechanicCard key={mechanic.id} mechanic={mechanic} />
      ))}
    </div>
  );
}
