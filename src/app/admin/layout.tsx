"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Wrench, FileText, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Spare parts", href: "/admin/spare-parts", icon: Wrench },
  { label: "Audit logs", href: "/admin/audit-logs", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card shrink-0 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!sidebarCollapsed && (
            <Link href="/admin" className="text-xl font-bold tracking-tight text-primary">
              RoadResQ Admin
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapsed}
            className="h-9 w-9 rounded-xl shrink-0 mx-auto"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  sidebarCollapsed && "justify-center px-0"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar} />
          <div className="relative flex w-64 flex-col border-r bg-card p-4">
            <div className="flex h-12 items-center border-b px-2 mb-4">
              <Link href="/admin" className="text-xl font-bold tracking-tight text-primary">
                RoadResQ Admin
              </Link>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleSidebar}
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
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden h-9 w-9 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">
              Admin Portal
            </span>
          </div>
          <div className="ml-auto">
            <UserMenu defaultName="Admin User" defaultRole="ADMIN" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
