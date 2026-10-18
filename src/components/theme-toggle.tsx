"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
  variant?: "dropdown" | "sub" | "inline";
  align?: "start" | "center" | "end";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({
  className,
  variant = "dropdown",
  align = "end",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    if (variant === "sub") {
      return (
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
          <Sun className="h-4 w-4" />
          <span>Theme</span>
        </div>
      );
    }
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9 rounded-xl text-muted-foreground", className)}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  // Variant for rendering inside an existing DropdownMenu (e.g. UserMenu)
  if (variant === "sub") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn("rounded-lg cursor-pointer", className)}>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="ml-6">Theme</span>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="rounded-xl p-1 min-w-[120px]">
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="flex items-center justify-between rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="flex items-center justify-between rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="flex items-center justify-between rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <span>System</span>
            </div>
            {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  // Inline segmented switch variant
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-xl border border-border bg-card p-1 text-muted-foreground",
          className
        )}
        role="group"
        aria-label="Theme selector"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-1.5 transition-colors",
            theme === "light"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "hover:text-foreground"
          )}
          aria-label="Light mode"
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-1.5 transition-colors",
            theme === "dark"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "hover:text-foreground"
          )}
          aria-label="Dark mode"
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-1.5 transition-colors",
            theme === "system"
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "hover:text-foreground"
          )}
          aria-label="System default theme"
          title="System default theme"
        >
          <Laptop className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Default: standalone trigger button with DropdownMenu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label="Select theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0 text-foreground" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100 text-foreground" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-36 rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
