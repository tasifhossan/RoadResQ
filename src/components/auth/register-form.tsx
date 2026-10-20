"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, User, Wrench, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { FormattedError, Role } from "@/lib/api/types";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "MECHANIC"], {
    message: "Role selection is required",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = React.useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "CUSTOMER",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || null,
          role: data.role,
        }),
      });

      const regResult = await regRes.json();

      if (regRes.ok && regResult.success) {
        toast.success("Account created successfully! Signing in...");

        // Auto login with credentials
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          });

          const loginResult = await loginRes.json();

          if (loginRes.ok && loginResult.success) {
            const userRole = loginResult.data.user.role as Role;
            const targetPath = ROLE_HOME_MAP[userRole] || "/";
            router.replace(targetPath);
            router.refresh();
          } else {
            toast.error("Account created! Please log in with your credentials.");
            router.replace("/login");
          }
        } catch {
          toast.error("Account created! Please log in with your credentials.");
          router.replace("/login");
        }
      } else {
        if (regResult.errors && Array.isArray(regResult.errors) && regResult.errors.length > 0) {
          let hasMappedFieldError = false;
          regResult.errors.forEach((err: FormattedError) => {
            if (err.field && ["name", "email", "password", "phone", "role"].includes(err.field)) {
              setError(err.field as keyof RegisterFormData, {
                type: "server",
                message: err.message,
              });
              hasMappedFieldError = true;
            }
          });

          if (!hasMappedFieldError) {
            toast.error(regResult.message || "Registration failed");
          }
        } else {
          toast.error(regResult.message || "Failed to create account");
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
        const targetPath = ROLE_HOME_MAP[user.role as Role] || "/";
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
          <UserPlus className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Join RoadResQ as a Customer or Mechanic
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <Label>I want to register as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isAnyLoading}
                onClick={() => setValue("role", "CUSTOMER")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "CUSTOMER"
                    ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                    : "border-border/60 hover:border-border text-muted-foreground bg-card"
                }`}
              >
                <User className="w-5 h-5 mb-1 text-blue-500" />
                <span className="text-xs">Customer</span>
                <span className="text-[10px] text-muted-foreground font-normal">Need assistance</span>
              </button>

              <button
                type="button"
                disabled={isAnyLoading}
                onClick={() => setValue("role", "MECHANIC")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "MECHANIC"
                    ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                    : "border-border/60 hover:border-border text-muted-foreground bg-card"
                }`}
              >
                <Wrench className="w-5 h-5 mb-1 text-orange-600 dark:text-orange-400" />
                <span className="text-xs">Mechanic</span>
                <span className="text-[10px] text-muted-foreground font-normal">Provide repairs</span>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-destructive font-medium">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              disabled={isAnyLoading}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="alex@example.com"
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
            <Label htmlFor="reg-phone">Phone Number (Optional)</Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="+8801700000000"
              autoComplete="tel"
              disabled={isAnyLoading}
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

          <Button type="submit" className="w-full h-10 font-semibold mt-2" disabled={isAnyLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
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
            <span className="bg-card px-2 text-muted-foreground font-medium">Or</span>
          </div>
        </div>

        <div className="space-y-2">
          <GoogleSignInButton />
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            New accounts created with Google are customer accounts. To work as a mechanic, register with email and choose Mechanic.
          </p>
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
                <Wrench className="mr-1.5 h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
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
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Admin
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
