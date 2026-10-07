"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { ArrowRight, LayoutDashboard, UserPlus, LogIn } from "lucide-react";

export function HeroCtas() {
  const { user, isAuthenticated } = useSession();

  if (isAuthenticated && user) {
    const dashboardHref = ROLE_HOME_MAP[user.role] || "/";

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <Link href={dashboardHref} className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md px-8 h-12 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Go to dashboard
          </Button>
        </Link>
        <Link href="/how-it-works" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full border-border hover:bg-muted font-medium rounded-xl px-8 h-12 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Explore workflow
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
      <Link href="/register" className="w-full sm:w-auto">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md px-8 h-12 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Get started
        </Button>
      </Link>
      <Link href="/login" className="w-full sm:w-auto">
        <Button
          size="lg"
          variant="outline"
          className="w-full border-border hover:bg-muted font-medium rounded-xl px-8 h-12 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Try a demo
        </Button>
      </Link>
    </div>
  );
}
