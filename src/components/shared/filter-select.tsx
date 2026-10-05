"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectProps {
  paramName: string;
  label?: string;
  placeholder?: string;
  options: FilterOption[];
  allLabel?: string;
  className?: string;
}

export function FilterSelect({
  paramName,
  placeholder = "Select filter...",
  options,
  allLabel = "All",
  className,
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentValue = searchParams.get(paramName) || "all";

  const handleChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set(paramName, val);
    } else {
      params.delete(paramName);
    }
    // Reset page on filter change
    params.delete("page");

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl);
  };

  const selectedLabel =
    currentValue === "all"
      ? allLabel
      : options.find((o) => o.value === currentValue)?.label || currentValue;

  return (
    <div className={cn("w-full max-w-[200px]", className)}>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="rounded-xl bg-card border-border shadow-sm">
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
