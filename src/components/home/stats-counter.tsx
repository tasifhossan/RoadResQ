"use client";

import * as React from "react";
import { PublicStats } from "@/lib/types/public";
import { CheckCircle2, Users, Wrench, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsCounterProps {
  stats: PublicStats;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StatsCounter({ stats }: StatsCounterProps) {
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const [hasAnimated, setHasAnimated] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [counts, setCounts] = React.useState({
    jobs: 0,
    mechanics: 0,
    customers: 0,
    rating: 0,
  });

  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1200; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts({
              jobs: Math.round(stats.completedJobs * easeOut),
              mechanics: Math.round(stats.mechanics.total * easeOut),
              customers: Math.round(stats.customers * easeOut),
              rating: Number((stats.reviews.averageRating * easeOut).toFixed(2)),
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts({
                jobs: stats.completedJobs,
                mechanics: stats.mechanics.total,
                customers: stats.customers,
                rating: stats.reviews.averageRating,
              });
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [stats, hasAnimated, prefersReducedMotion]);

  const activeCounts = prefersReducedMotion
    ? {
        jobs: stats.completedJobs,
        mechanics: stats.mechanics.total,
        customers: stats.customers,
        rating: stats.reviews.averageRating,
      }
    : counts;

  const STAT_ITEMS = [
    {
      label: "Completed Rescues",
      value: activeCounts.jobs.toLocaleString(),
      suffix: "+",
      icon: CheckCircle2,
      description: "Successful roadside repairs & tows",
    },
    {
      label: "Active Mechanics",
      value: activeCounts.mechanics.toLocaleString(),
      suffix: "",
      icon: Wrench,
      description: `${stats.mechanics.availableNow} available for dispatch right now`,
    },
    {
      label: "Registered Motorists",
      value: activeCounts.customers.toLocaleString(),
      suffix: "",
      icon: Users,
      description: "Drivers in the RoadResQ network",
    },
    {
      label: "Average Rating",
      value: activeCounts.rating.toFixed(1),
      suffix: " / 5",
      icon: Star,
      description: `Based on ${stats.reviews.count} reviews from completed jobs`,
    },
  ];

  return (
    <section id="stats" ref={containerRef} className="scroll-m-24 py-12 md:py-16 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-0.5 text-xs font-semibold border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 inline-block mr-1.5 animate-pulse" />
                Live from the database
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Real Roadside Assistance Activity
            </h2>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right max-w-xs">
            Live metrics aggregated directly from completed database service records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-border/80 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    {item.value}
                    <span className="text-primary text-2xl font-bold">{item.suffix}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
