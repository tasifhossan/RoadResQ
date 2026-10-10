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
  showAllOption?: boolean;
  defaultValue?: string;
  className?: string;
}

export function FilterSelect({
  paramName,
  placeholder = "Select filter...",
  options,
  allLabel = "All",
  showAllOption,
  defaultValue,
  className,
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Deduplicate: Omit 'all' option if showAllOption is false, or if defaultValue is provided,
  // or if one of the options already has a label matching allLabel.
  const shouldShowAll =
    showAllOption !== undefined
      ? showAllOption
      : !defaultValue && !options.some((o) => o.label.toLowerCase() === allLabel.toLowerCase());

  const fallbackValue = shouldShowAll ? "all" : (defaultValue || options[0]?.value || "all");
  const currentValue = searchParams.get(paramName) || fallbackValue;

  const handleChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const resetValue = shouldShowAll ? "all" : (defaultValue || options[0]?.value);

    if (val && val !== resetValue && val !== "all") {
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

  const selectedOption = options.find((o) => o.value === currentValue);
  const selectedLabel =
    currentValue === "all" && shouldShowAll
      ? allLabel
      : selectedOption?.label || currentValue;

  return (
    <div className={cn("w-full max-w-[200px]", className)}>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="rounded-xl bg-card border-border shadow-sm">
          <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {shouldShowAll && <SelectItem value="all">{allLabel}</SelectItem>}
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
