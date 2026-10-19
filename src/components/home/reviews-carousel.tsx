"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { PublicReviewItem } from "@/lib/types/public";
import { cn } from "@/lib/utils";

interface ReviewsCarouselProps {
  reviews: PublicReviewItem[];
}

/**
 * Formats reviewer name to first name plus last initial.
 * e.g. "Mohammad Rafiqul Islam" -> "Mohammad I."
 * If already formatted like "Sultana R.", keeps it as is.
 */
function formatReviewerName(name: string): string {
  if (!name) return "Verified Driver";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (last.length <= 2 && last.endsWith(".")) return `${first} ${last}`;
  return `${first} ${last[0]}.`;
}

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="relative space-y-4">
      {/* Scroll controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {reviews.length} recent reviews from completed roadside jobs
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous review"
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next review"
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll container with scroll snap */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Recent customer reviews"
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl scrollbar-none"
      >
        {reviews.map((review, idx) => {
          const formattedName = formatReviewerName(review.reviewerName);
          const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <article
              key={`${review.reviewerName}-${idx}`}
              className="min-w-[280px] sm:min-w-[340px] max-w-[360px] snap-start rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:border-border/80 hover:shadow-sm shrink-0"
            >
              <div className="space-y-3">
                {/* Header: Star Rating & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Job</span>
                  </span>
                </div>

                {/* Review Comment */}
                <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">
                  &ldquo;{review.comment || "Service request completed successfully. Mechanic handled the breakdown promptly."}&rdquo;
                </p>
              </div>

              {/* Footer: Reviewer and Mechanic Link */}
              <div className="pt-3 border-t border-border/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{formattedName}</span>
                  <time dateTime={review.createdAt} className="text-muted-foreground text-[11px]">
                    {formattedDate}
                  </time>
                </div>
                {review.mechanic && (
                  <p className="text-muted-foreground text-[11px] truncate">
                    Serviced by{" "}
                    <Link
                      href={`/mechanics/${review.mechanic.id}`}
                      className="font-medium text-primary hover:underline underline-offset-4"
                    >
                      {review.mechanic.name}
                    </Link>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
