"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/components/providers/session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { LogOut, User as UserIcon } from "lucide-react";
import { Role } from "@/lib/api/types";

export interface UserMenuProps {
  defaultName?: string;
  defaultRole?: Role;
}

export function UserMenu({ defaultName = "User", defaultRole = "CUSTOMER" }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const name = user?.name || defaultName;
  const role = user?.role || defaultRole;
  const email = user?.email || "No email";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout attempt
    }
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none p-1 rounded-full hover:bg-muted transition-colors">
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-semibold leading-none text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground mt-0.5 capitalize">{role.toLowerCase()}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
            <div className="pt-1">
              <StatusBadge status={role} />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-lg cursor-pointer text-muted-foreground">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="rounded-lg cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
