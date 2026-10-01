"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  placeholder?: string;
  paramName?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  paramName = "search",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramValue = searchParams.get(paramName) || "";
  const [value, setValue] = useState(paramValue);

  // Sync state if URL search param changes externally
  const [prevParamValue, setPrevParamValue] = useState(paramValue);
  if (paramValue !== prevParamValue) {
    setPrevParamValue(paramValue);
    setValue(paramValue);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get(paramName) || "";
      if (value === currentParam) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(paramName, value.trim());
      } else {
        params.delete(paramName);
      }
      // Reset page on search change
      params.delete("page");

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, paramName, debounceMs, pathname, router, searchParams]);

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 rounded-xl bg-card border-border shadow-sm focus-visible:ring-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
