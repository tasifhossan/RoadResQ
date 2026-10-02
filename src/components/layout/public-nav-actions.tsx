"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { LogOut } from "lucide-react";

export function PublicNavActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSession();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout
    }
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  if (isAuthenticated && user) {
    const dashboardHref = ROLE_HOME_MAP[user.role] || "/";

    return (
      <div className="flex items-center gap-3">
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
    <div className="flex items-center gap-3">
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
