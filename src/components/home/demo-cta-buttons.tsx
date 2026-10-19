"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, Wrench, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Role } from "@/lib/api/types";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { toast } from "sonner";

export function DemoCtaButtons() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = React.useState<Role | null>(null);

  const handleDemoLogin = async (role: Role) => {
    setLoadingRole(role);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const targetPath = ROLE_HOME_MAP[role] || "/";
        toast.success(`Authenticated as Demo ${role.toLowerCase()}`);
        router.push(targetPath);
        router.refresh();
      } else {
        toast.error(result.message || "Demo login failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  };

  const isAnyLoading = loadingRole !== null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        <Button
          type="button"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("CUSTOMER")}
          className="rounded-xl h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
        >
          {loadingRole === "CUSTOMER" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span>Demo Customer</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("MECHANIC")}
          className="rounded-xl h-12 font-semibold border-border hover:bg-muted text-foreground shadow-sm gap-2"
        >
          {loadingRole === "MECHANIC" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wrench className="h-4 w-4 text-primary" />
          )}
          <span>Demo Mechanic</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isAnyLoading}
          onClick={() => handleDemoLogin("ADMIN")}
          className="rounded-xl h-12 font-semibold border-border hover:bg-muted text-foreground shadow-sm gap-2"
        >
          {loadingRole === "ADMIN" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 text-primary" />
          )}
          <span>Demo Admin</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        No password or email verification required for demo sessions.
      </p>
    </div>
  );
}
