"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  ChevronDown,
  Menu,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";

// Common base links shown to all users
const BASE_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Mechanics", href: "/mechanics" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Blog", href: "/blog" },
];

// Logged out public links (6 routes total)
const LOGGED_OUT_NAV_LINKS = [
  ...BASE_NAV_LINKS,
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Advanced "More" dropdown links for logged in users
const MORE_NAV_LINKS = [
  { label: "Assistant", href: "/assistant" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Support", href: "/support" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout
    }
    queryClient.clear();
    setMobileOpen(false);
    router.replace("/login");
    router.refresh();
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isMoreActive = MORE_NAV_LINKS.some((item) => isLinkActive(item.href));

  // Role-specific links for logged-in desktop view (2 links per role)
  const getRoleLinks = () => {
    if (!user) return [];
    if (user.role === "CUSTOMER") {
      return [
        { label: "New request", href: "/customer/requests/new" },
        { label: "My requests", href: "/customer/requests" },
      ];
    }
    if (user.role === "MECHANIC") {
      return [
        { label: "Jobs", href: "/mechanic/requests" },
        { label: "Inventory", href: "/mechanic/inventory" },
      ];
    }
    if (user.role === "ADMIN") {
      return [
        { label: "Dashboard", href: "/admin" },
        { label: "Requests", href: "/admin/requests" },
      ];
    }
    return [];
  };

  const roleLinks = getRoleLinks();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const dashboardHref = user ? ROLE_HOME_MAP[user.role] || "/" : "/";
  const profileHref =
    user?.role === "ADMIN"
      ? "/admin/profile"
      : user?.role === "MECHANIC"
      ? "/mechanic/profile"
      : "/customer/profile";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-primary hover:opacity-90 transition-opacity"
          >
            RoadResQ
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 text-sm font-medium"
            aria-label="Main Navigation"
          >
            {isLoading ? (
              // Fixed-size links placeholder while session loads (zero CLS)
              <div className="flex items-center gap-2">
                {BASE_NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-xl transition-colors",
                      isLinkActive(item.href)
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : !isAuthenticated || !user ? (
              // Logged Out (6 routes)
              LOGGED_OUT_NAV_LINKS.map((item) => {
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-xl transition-colors",
                      active
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })
            ) : (
              // Logged In: Base links + 2 role links + More dropdown
              <>
                {BASE_NAV_LINKS.map((item) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-xl transition-colors",
                        active
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* Role-specific links */}
                {roleLinks.map((item) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-xl transition-colors",
                        active
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* "More" Advanced Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "inline-flex items-center justify-center font-medium text-sm gap-1 rounded-xl px-3 py-2 h-auto text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none",
                      isMoreActive && "text-primary font-semibold"
                    )}
                    aria-label="More navigation options"
                  >
                    <span>More</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 rounded-xl p-1.5 shadow-md">
                    {MORE_NAV_LINKS.slice(0, 4).map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg cursor-pointer",
                          isLinkActive(item.href) && "text-primary font-semibold"
                        )}
                      >
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {MORE_NAV_LINKS.slice(4).map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg cursor-pointer",
                          isLinkActive(item.href) && "text-primary font-semibold"
                        )}
                      >
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>

        {/* Right Actions: Theme Toggle, Auth / Profile, Mobile Drawer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Desktop Auth / User Controls */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              // Fixed-size placeholder while session loads (zero CLS)
              <div
                className="w-[140px] h-9 bg-muted/60 animate-pulse rounded-xl"
                aria-hidden="true"
              />
            ) : isAuthenticated && user ? (
              // Logged in: Profile Dropdown
              <UserMenu />
            ) : (
              // Logged out: Login and Register buttons
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium rounded-xl">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Drawer */}
          <div className="flex md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="h-9 w-9 rounded-xl text-foreground inline-flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 flex flex-col justify-between">
                <div>
                  <SheetHeader className="p-4 border-b border-border text-left">
                    <SheetTitle className="text-lg font-bold text-primary">
                      RoadResQ
                    </SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                    {/* User Profile Card (if logged in) */}
                    {isAuthenticated && user && (
                      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                            <div className="pt-1">
                              <StatusBadge status={user.role} />
                            </div>
                          </div>
                        </div>

                        {/* Quick Dashboard & Profile Links */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                          <Link
                            href={dashboardHref}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href={profileHref}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <UserIcon className="h-3.5 w-3.5" />
                            <span>Profile</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                        Navigation
                      </p>
                      {BASE_NAV_LINKS.map((item) => {
                        const active = isLinkActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                              active
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}

                      {/* Logged in Role Links */}
                      {isAuthenticated && user && roleLinks.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                            {user.role === "CUSTOMER"
                              ? "Requests"
                              : user.role === "MECHANIC"
                              ? "Mechanic Workspace"
                              : "Admin"}
                          </p>
                          {roleLinks.map((item) => {
                            const active = isLinkActive(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                  active
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* More Public / Informational Links */}
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                          More Information
                        </p>
                        {MORE_NAV_LINKS.map((item) => {
                          const active = isLinkActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                                active
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Drawer Bottom: Theme + Auth Action */}
                <div className="p-4 border-t border-border bg-card/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle variant="inline" />
                  </div>

                  {isLoading ? (
                    <div className="h-10 w-full bg-muted/60 animate-pulse rounded-xl" />
                  ) : isAuthenticated && user ? (
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full rounded-xl gap-2 font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full rounded-xl">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
