"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { LogOut } from "lucide-react";
import { queryKeys } from "@/lib/api/keys";

export function PublicNavActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useSession();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  // Fixed-size placeholder while client session is loading to avoid layout shift
  if (isLoading) {
    return (
      <div
        className="w-[140px] h-9 bg-muted/60 animate-pulse rounded-xl shrink-0"
        aria-hidden="true"
      />
    );
  }

  if (isAuthenticated && user) {
    const dashboardHref = ROLE_HOME_MAP[user.role] || "/";

    return (
      <div className="flex items-center gap-3 shrink-0">
        <Link href={dashboardHref}>
          <Button variant="ghost" size="sm" className="font-medium rounded-xl">
            Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="font-medium rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Logout
        </Button>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="font-medium rounded-xl">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl">
          Register
        </Button>
      </Link>
    </div>
  );
}
