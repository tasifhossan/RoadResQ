"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  CircleDot,
  Activity,
  Truck,
  Key,
  Fuel,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HeroCtas } from "@/components/home/hero-ctas";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: "slide-request",
    badge: "Instant Geolocation Dispatch",
    title: "Stranded on the Road?",
    highlight: "Request Help in Minutes",
    description:
      "Share your breakdown coordinates or use our Dhaka demo location. Select your vehicle, describe the issue, and discover verified roadside technicians nearby.",
  },
  {
    id: "slide-tracking",
    badge: "Real-Time Rescue Milestones",
    title: "Track Your Technician",
    highlight: "From En Route to Arrival",
    description:
      "Follow live status transitions every step of the way: assigned, traveling to your location, on-site arrival, and active diagnostic repair with transparent progress.",
  },
  {
    id: "slide-payment",
    badge: "Itemized Invoices & Test Mode",
    title: "Transparent Invoicing",
    highlight: "With Frozen Parts Pricing",
    description:
      "Every replacement part is price-locked at the exact timestamp of use. Review labor charges, checkout safely via SSLCommerz sandbox, and rate your mechanic.",
  },
];

const PROBLEM_CHIPS = [
  { label: "Battery", skill: "Battery", icon: Zap },
  { label: "Tire", skill: "Tire", icon: CircleDot },
  { label: "Engine", skill: "Engine", icon: Activity },
  { label: "Towing", skill: "Towing", icon: Truck },
  { label: "Lockout", skill: "Lockout", icon: Key },
  { label: "Fuel Delivery", skill: "Fuel Delivery", icon: Fuel },
];

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

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Check prefers-reduced-motion via external store to avoid cascading renders
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  // Autoplay timer: advances every 6s unless paused or reduced-motion is requested
  React.useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handleScrollDown = () => {
    const target = document.getElementById("services");
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <section
      id="hero"
      aria-roledescription="carousel"
      aria-label="Roadside rescue highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="relative w-full border-b border-border/40 bg-gradient-to-b from-background via-card/40 to-background flex flex-col justify-between overflow-hidden md:h-[65svh] md:min-h-[520px] md:max-h-[70svh]"
    >
      {/* Background ambient gradient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full opacity-60 dark:opacity-40"
        aria-hidden="true"
      />

      {/* Main Slide Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center py-8 md:py-6">
        <div className="max-w-3xl space-y-4 md:space-y-5">
          {/* Slide Badge */}
          <div>
            <Badge
              variant="outline"
              className="rounded-full px-3.5 py-1 text-xs font-semibold border-primary/30 text-primary bg-primary/5 transition-all duration-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block mr-2 animate-pulse" />
              {activeSlide.badge}
            </Badge>
          </div>

          {/* Slide Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] min-h-[3.8rem] sm:min-h-[3.6rem]">
            {activeSlide.title}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {activeSlide.highlight}
            </span>
          </h1>

          {/* Slide Excerpt */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto min-h-[4rem] sm:min-h-[3.2rem]">
            {activeSlide.description}
          </p>

          {/* Session-Aware CTAs */}
          <div className="pt-1">
            <HeroCtas />
          </div>

          {/* Quick Problem Filter Chips */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Common Emergency Problems
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {PROBLEM_CHIPS.map((chip) => {
                const IconComponent = chip.icon;
                return (
                  <Link
                    key={chip.skill}
                    href={`/mechanics?skill=${encodeURIComponent(chip.skill)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors shadow-2xs"
                  >
                    <IconComponent className="h-3 w-3 text-primary shrink-0" />
                    <span>{chip.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls & Scroll Down Indicator Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 flex items-center justify-between text-xs text-muted-foreground z-10">
        {/* Left: Previous / Next & Indicators */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={currentSlide === idx ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === idx
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Slide indicator */}
        <span className="hidden sm:inline-block font-mono text-[11px]">
          0{currentSlide + 1} / 0{SLIDES.length}
        </span>

        {/* Right: Scroll Down Indicator Button */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span>Explore Services</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>
    </section>
  );
}
