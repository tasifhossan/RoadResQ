"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";
import { LayoutDashboard, Package, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mechanicNavItems = [
  { label: "Dashboard", href: "/mechanic", icon: LayoutDashboard },
  { label: "Inventory", href: "/mechanic/inventory", icon: Package },
  { label: "Earnings", href: "/mechanic/earnings", icon: DollarSign },
  { label: "Profile", href: "/mechanic/profile", icon: User },
];

export default function MechanicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shrink-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/mechanic" className="text-xl font-bold tracking-tight text-primary">
            RoadResQ
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {mechanicNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/mechanic" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/mechanic" className="text-lg font-bold tracking-tight text-primary">
              RoadResQ
            </Link>
          </div>
          <div className="ml-auto">
            <UserMenu defaultName="Bob Mechanic" defaultRole="MECHANIC" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card/95 backdrop-blur-md md:hidden px-2">
        {mechanicNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/mechanic" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
