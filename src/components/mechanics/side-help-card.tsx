"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SideHelpCardProps {
  className?: string;
}

export function SideHelpCard({ className }: SideHelpCardProps) {
  const { user, isAuthenticated, isLoading } = useSession();

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const isMechanicOrAdmin = isAuthenticated && (user?.role === "MECHANIC" || user?.role === "ADMIN");

  return (
    <div
      data-slot="side-help-card"
      className={cn(
        "card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-5",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Wrench className="size-4" />
          <span>RoadResQ Dispatch</span>
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          Need roadside help?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          A qualified mechanic is automatically assigned based on proximity and vehicle needs
          after your request is created.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="h-10 w-full rounded-xl bg-muted/60 animate-pulse" />
        ) : isMechanicOrAdmin ? (
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
            <span>
              Logged in as a {user?.role.toLowerCase()}. Emergency requests are submitted by customers.
            </span>
          </div>
        ) : isCustomer ? (
          <Link
            href="/customer/requests/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full rounded-xl font-semibold gap-2 justify-center shadow-xs"
            )}
          >
            <span>Request Roadside Help</span>
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link
            href="/login?next=/customer/requests/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full rounded-xl font-semibold gap-2 justify-center shadow-xs"
            )}
          >
            <span>Request Roadside Help</span>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="border-t border-border/60 pt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span>Verified & background-checked technicians</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span>Transparent upfront pricing & invoices</span>
        </div>
      </div>
    </div>
  );
}
