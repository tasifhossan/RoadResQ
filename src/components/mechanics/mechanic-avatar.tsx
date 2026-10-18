"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface MechanicAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  priority?: boolean;
}

function getInitials(name: string): string {
  if (!name) return "M";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Large mechanic profile avatar using next/image with fallback to styled initials.
 */
export function MechanicAvatar({
  src,
  name,
  className,
  priority = true,
}: MechanicAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm shrink-0",
        className
      )}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 96px, 128px"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/15 via-muted to-orange-500/15 font-bold tracking-tight text-muted-foreground select-none">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
