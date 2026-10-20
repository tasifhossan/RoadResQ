"use client";

import * as React from "react";
import { Search, X, Wrench, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InstantSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSkill: (skill: string) => void;
  onSelectCity: (city: string) => void;
  skillFacets: Array<{ value: string; count: number }>;
  cityFacets: Array<{ value: string; count: number }>;
  className?: string;
}

export function InstantSearchBox({
  value,
  onChange,
  onSelectSkill,
  onSelectCity,
  skillFacets,
  cityFacets,
  className,
}: InstantSearchBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Compute instant matching suggestions (up to 6 total)
  const suggestions = React.useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return [];

    const matchedSkills = skillFacets
      .filter((s) => s.value.toLowerCase().includes(trimmed))
      .slice(0, 4)
      .map((s) => ({
        type: "skill" as const,
        label: s.value,
        count: s.count,
      }));

    const matchedCities = cityFacets
      .filter((c) => c.value.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .map((c) => ({
        type: "city" as const,
        label: c.value,
        count: c.count,
      }));

    return [...matchedSkills, ...matchedCities].slice(0, 6);
  }, [value, skillFacets, cityFacets]);

  // Close combobox when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (index: number) => {
    const item = suggestions[index];
    if (!item) return;

    if (item.type === "skill") {
      onSelectSkill(item.label);
    } else {
      onSelectCity(item.label);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(activeIndex);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen && suggestions.length > 0}
        aria-autocomplete="list"
        aria-controls="search-instant-suggestions"
        aria-activedescendant={
          activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search by mechanic name, skill, or city..."
        className="pl-10 pr-9 rounded-xl h-11 bg-card border-border shadow-xs text-sm"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setIsOpen(false);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
          aria-label="Clear search text"
        >
          <X className="size-4" />
        </button>
      )}

      {/* Instant suggestions listbox */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="search-instant-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-12 z-50 p-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg space-y-0.5 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {suggestions.map((item, idx) => {
            const isSelected = activeIndex === idx;

            return (
              <li
                key={`${item.type}-${item.label}`}
                id={`suggestion-item-${idx}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelectSuggestion(idx)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors",
                  isSelected
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.type === "skill" ? (
                    <Wrench className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <MapPin className="size-3.5 text-blue-500 shrink-0" />
                  )}
                  <span>
                    {item.label}{" "}
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      ({item.type})
                    </span>
                  </span>
                </div>

                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {item.count} {item.count === 1 ? "mechanic" : "mechanics"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
