"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, User, Wrench, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { FormattedError, Role } from "@/lib/api/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = React.useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = React.useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const getValidRedirectPath = (userRole: Role): string => {
    const rawNext = searchParams.get("next");
    const defaultHome = ROLE_HOME_MAP[userRole] || "/";

    if (!rawNext) return defaultHome;

    // Must be a relative path starting with a single '/' and not '//'
    if (!rawNext.startsWith("/") || rawNext.startsWith("//")) {
      return defaultHome;
    }

    // Must belong to the user's role prefix
    const expectedPrefix = ROLE_HOME_MAP[userRole];
    if (
      expectedPrefix &&
      (rawNext === expectedPrefix || rawNext.startsWith(expectedPrefix + "/"))
    ) {
      return rawNext;
    }

    return defaultHome;
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const user = result.data.user;
        const targetPath = getValidRedirectPath(user.role);
        toast.success(`Welcome back, ${user.name || "User"}!`);
        router.replace(targetPath);
        router.refresh();
      } else {
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          let hasMappedFieldError = false;
          result.errors.forEach((err: FormattedError) => {
            if (err.field && (err.field === "email" || err.field === "password")) {
              setError(err.field as keyof LoginFormData, {
                type: "server",
                message: err.message,
              });
              hasMappedFieldError = true;
            }
          });

          if (!hasMappedFieldError) {
            toast.error(result.message || "Invalid credentials");
          }
        } else {
          toast.error(result.message || "Invalid email or password");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleDemoLogin = async (role: Role) => {
    setDemoLoadingRole(role);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const user = result.data.user;
        const targetPath = getValidRedirectPath(user.role);
        toast.success(`Logged in as Demo ${role.toLowerCase()}`);
        router.replace(targetPath);
        router.refresh();
      } else {
        toast.error(result.message || "Demo login failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const isAnyLoading = isSubmitting || demoLoadingRole !== null;

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/60 bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Enter your credentials to access your RoadResQ account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isAnyLoading}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isAnyLoading}
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAnyLoading}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-10 font-semibold" disabled={isAnyLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Or quick demo sign in</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 justify-center"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("CUSTOMER")}
          >
            {demoLoadingRole === "CUSTOMER" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <User className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                Customer
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 justify-center"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("MECHANIC")}
          >
            {demoLoadingRole === "MECHANIC" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Wrench className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Mechanic
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 justify-center"
            disabled={isAnyLoading}
            onClick={() => handleDemoLogin("ADMIN")}
          >
            {demoLoadingRole === "ADMIN" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                Admin
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
