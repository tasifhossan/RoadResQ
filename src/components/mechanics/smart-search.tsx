"use client";

import * as React from "react";
import { Sparkles, Loader2, Check, X, CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SearchIntentData } from "@/lib/ai/search-rules";
import { cn } from "@/lib/utils";

export interface SmartSearchProps {
  skillFacets: Array<{ value: string; count: number }>;
  cityFacets: Array<{ value: string; count: number }>;
  onApplyFilters: (filters: {
    skill?: string;
    city?: string;
    availability?: string;
    minRating?: number;
    sortBy?: string;
  }) => void;
  className?: string;
}

const EXAMPLE_QUERIES = [
  "steam from the hood, need mechanic in Dhaka",
  "puncture on the highway, someone available now in Chattogram",
  "dead battery click sound, top rated",
  "brakes making grinding noise, available now",
];

export function SmartSearch({
  skillFacets,
  cityFacets,
  onApplyFilters,
  className,
}: SmartSearchProps) {
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SearchIntentData | null>(null);
  const [source, setSource] = React.useState<"ai" | "rules" | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [selectedAlternativeSkill, setSelectedAlternativeSkill] = React.useState<string | null>(null);

  // Rotate random placeholder
  const placeholderExample = React.useMemo(() => {
    return EXAMPLE_QUERIES[0];
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3 || isLoading) return;

    setIsLoading(true);
    setNotice(null);

    const skills = skillFacets.map((f) => f.value).slice(0, 40);
    const cities = cityFacets.map((f) => f.value).slice(0, 40);

    try {
      const res = await fetch("/api/ai/search-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          skills,
          cities,
        }),
      });

      const json = await res.json();

      if (res.status === 429) {
        setNotice("Rate limit reached: showing rule-based filter suggestions.");
      }

      if (json.success && json.data) {
        setResult(json.data);
        setSource(json.meta?.source || "rules");
        setSelectedAlternativeSkill(null);
        if (json.meta?.redacted) {
          setNotice("Personal data was redacted for privacy.");
        }
      } else {
        setNotice("Could not parse filters. Try typing a specific problem like 'flat tire'.");
      }
    } catch {
      setNotice("Network error. Could not connect to smart search.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (targetSkill?: string) => {
    if (!result) return;

    // The backend accepts ONE skill: apply targetSkill or first skill
    const appliedSkill =
      targetSkill ||
      selectedAlternativeSkill ||
      (result.skills.length > 0 ? result.skills[0] : undefined);

    onApplyFilters({
      skill: appliedSkill,
      city: result.city || undefined,
      availability: result.availability || undefined,
      minRating: result.minRating || undefined,
      sortBy: result.sortBy || undefined,
    });

    setResult(null);
  };

  const handleDismiss = () => {
    setResult(null);
    setNotice(null);
  };

  return (
    <div className={cn("relative flex flex-col gap-2 w-full sm:w-auto", className)}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-72 md:w-80">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 200))}
            placeholder={`AI: "${placeholderExample}"`}
            className="pr-16 pl-9 rounded-xl h-11 bg-card border-border shadow-xs text-sm"
            disabled={isLoading}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-primary">
            <Sparkles className="size-4 animate-pulse" />
          </div>

          <Badge
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold py-0 px-1.5 h-5 pointer-events-none"
          >
            AI
          </Badge>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={query.trim().length < 3 || isLoading}
          className="rounded-xl h-11 px-3 text-xs font-medium"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span>Smart Search</span>
              <CornerDownLeft className="size-3.5 ml-1 hidden sm:inline" />
            </>
          )}
        </Button>
      </form>

      {/* Notice / Warning banner if any */}
      {notice && (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="underline ml-2">
            dismiss
          </button>
        </div>
      )}

      {/* Suggested Filters Card */}
      {result && (
        <div className="absolute top-13 left-0 z-40 w-full sm:w-96 p-3.5 bg-popover/95 backdrop-blur-md border border-border rounded-2xl shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground">Suggested filters</h4>
              {source === "rules" && (
                <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Basic fallback
                </span>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              aria-label="Dismiss suggested filters"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-snug">{result.explanation}</p>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Primary Skill */}
            {result.skills.length > 0 && (
              <Badge variant="default" className="text-xs py-0.5">
                Skill: {selectedAlternativeSkill || result.skills[0]}
              </Badge>
            )}

            {/* City */}
            {result.city && (
              <Badge variant="outline" className="text-xs py-0.5 bg-background">
                City: {result.city}
              </Badge>
            )}

            {/* Availability */}
            {result.availability && (
              <Badge variant="secondary" className="text-xs py-0.5">
                Status: {result.availability}
              </Badge>
            )}

            {/* Rating */}
            {result.minRating && (
              <Badge variant="secondary" className="text-xs py-0.5">
                Rating: {result.minRating}★+
              </Badge>
            )}

            {/* SortBy */}
            {result.sortBy && (
              <Badge variant="secondary" className="text-xs py-0.5">
                Sort: {result.sortBy}
              </Badge>
            )}
          </div>

          {/* Alternative skills if AI suggested multiple */}
          {result.skills.length > 1 && (
            <div className="pt-1 text-[11px] text-muted-foreground">
              <span className="font-medium mr-1">Other matching skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.skills.slice(1).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedAlternativeSkill(skill)}
                    className={cn(
                      "px-2 py-0.5 text-[11px] rounded-md border transition-colors",
                      selectedAlternativeSkill === skill
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 hover:bg-muted text-foreground border-border"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => handleApply()}
              className="h-7 text-xs px-3 font-medium"
            >
              <Check className="size-3.5 mr-1" />
              Apply filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
