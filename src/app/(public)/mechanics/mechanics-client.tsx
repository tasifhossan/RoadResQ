"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Star,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/api/keys";
import { getPublicMechanicsApi } from "@/lib/api/endpoints/public";
import { PublicMechanicsResponse } from "@/lib/types/public";
import {
  GetPublicMechanicsQueryInput,
  getPublicMechanicsQuerySchema,
} from "@/lib/validations/public";
import { MechanicGrid } from "@/components/mechanics/mechanic-card";
import { UrlPagination } from "@/components/shared/url-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface MechanicsClientProps {
  initialData: PublicMechanicsResponse;
  initialQuery?: GetPublicMechanicsQueryInput;
}

const RATING_OPTIONS = [
  { label: "4.5+ Stars", value: "4.5" },
  { label: "4.0+ Stars", value: "4.0" },
  { label: "3.5+ Stars", value: "3.5" },
  { label: "3.0+ Stars", value: "3.0" },
];

const AVAILABILITY_OPTIONS = [
  { label: "Available Now", value: "AVAILABLE" },
  { label: "Busy", value: "BUSY" },
  { label: "Offline", value: "OFFLINE" },
];

const MIN_JOBS_OPTIONS = [
  { label: "10+ jobs", value: "10" },
  { label: "25+ jobs", value: "25" },
  { label: "50+ jobs", value: "50" },
  { label: "100+ jobs", value: "100" },
];

const SORT_OPTIONS = [
  { label: "Top Rated", value: "rating" },
  { label: "Completed Jobs", value: "totalJobs" },
  { label: "Years Experience", value: "yearsExperience" },
  { label: "Newest Joined", value: "newest" },
];

export function MechanicsClient({ initialData, initialQuery }: MechanicsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse raw URL searchParams
  const rawParams = React.useMemo(() => {
    const raw: Record<string, unknown> = {};
    const pageVal = searchParams.get("page");
    if (pageVal) raw.page = Number(pageVal);
    raw.limit = 12;

    const searchVal = searchParams.get("search");
    if (searchVal) raw.search = searchVal;

    const skillVal = searchParams.get("skill");
    if (skillVal) raw.skill = skillVal;

    const minRatingVal = searchParams.get("minRating");
    if (minRatingVal) raw.minRating = Number(minRatingVal);

    const availabilityVal = searchParams.get("availability");
    if (availabilityVal) raw.availability = availabilityVal;

    const minJobsVal = searchParams.get("minJobs");
    if (minJobsVal) raw.minJobs = Number(minJobsVal);

    const sortByVal = searchParams.get("sortBy");
    if (sortByVal) raw.sortBy = sortByVal;

    const sortOrderVal = searchParams.get("sortOrder");
    if (sortOrderVal) raw.sortOrder = sortOrderVal;

    return raw;
  }, [searchParams]);

  // Validate searchParams with schema; fallback to defaults if invalid
  const queryInput: GetPublicMechanicsQueryInput = React.useMemo(() => {
    const parsed = getPublicMechanicsQuerySchema.safeParse(rawParams);
    if (parsed.success) {
      return parsed.data;
    }
    return {
      page: 1,
      limit: 12,
      sortBy: "rating",
      sortOrder: "desc",
      ...initialQuery,
    };
  }, [rawParams, initialQuery]);

  // Debounced search input local state
  const urlSearch = queryInput.search || "";
  const [searchValue, setSearchValue] = React.useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = React.useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchValue(urlSearch);
  }

  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

  // Debounced router update for search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get("search") || "";
      const trimmed = searchValue.trim();
      if (trimmed === currentParam) return;

      const nextParams = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        nextParams.set("search", trimmed);
      } else {
        nextParams.delete("search");
      }
      nextParams.delete("page"); // Reset page on search

      const qs = nextParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, pathname, router]);

  // TanStack Query with placeholderData: keepPreviousData
  const {
    data = initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.public.mechanics(queryInput as Record<string, unknown>),
    queryFn: () => getPublicMechanicsApi(queryInput),
    initialData,
    placeholderData: keepPreviousData,
  });

  // Dynamic skill options derived exclusively from backend response facets
  const skillFacets = data?.facets?.skills || initialData?.facets?.skills || [];

  // Update a single query param and push to URL
  const updateQueryParam = React.useCallback(
    (key: string, value: string | null) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
      nextParams.delete("page"); // Reset page on filter/sort change

      const qs = nextParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, pathname, router]
  );

  // Toggle sort order between asc and desc
  const toggleSortOrder = React.useCallback(() => {
    const currentOrder = queryInput.sortOrder || "desc";
    const nextOrder = currentOrder === "desc" ? "asc" : "desc";
    updateQueryParam("sortOrder", nextOrder);
  }, [queryInput.sortOrder, updateQueryParam]);

  // Clear all filters action
  const handleClearFilters = React.useCallback(() => {
    setSearchValue("");
    router.push(pathname);
  }, [pathname, router]);

  // Active filters calculation
  const hasActiveFilters = Boolean(
    queryInput.search ||
      queryInput.skill ||
      queryInput.minRating ||
      queryInput.availability ||
      queryInput.minJobs
  );

  const activeFilterCount =
    (queryInput.skill ? 1 : 0) +
    (queryInput.minRating ? 1 : 0) +
    (queryInput.availability ? 1 : 0) +
    (queryInput.minJobs ? 1 : 0);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Explore Certified Mechanics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
          Connect with trusted, background-checked roadside assistance professionals ready to
          respond to vehicle emergencies.
        </p>
      </div>

      {/* Search Bar & AI Smart Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by mechanic name, skill, or city..."
            className="pl-10 pr-9 rounded-xl h-11 bg-card border-border shadow-sm text-sm"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label="Clear search text"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Slot for future AI Smart Search feature (render nothing for now) */}
        <div
          id="ai-smart-search-slot"
          data-slot="ai-smart-search"
          className="empty:hidden"
          aria-hidden="true"
        />

        {/* Mobile Filters Trigger */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "sm:hidden flex items-center justify-center gap-2 rounded-xl h-11 font-medium cursor-pointer"
            )}
          >
            <SlidersHorizontal className="size-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-lg font-bold">Filter Mechanics</SheetTitle>
            </SheetHeader>

            <div className="space-y-5 py-6">
              {/* Mobile Skill filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Specialty Skill
                </label>
                <Select
                  value={queryInput.skill || "all"}
                  onValueChange={(val) => updateQueryParam("skill", val)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="All Skills" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Skills</SelectItem>
                    {skillFacets.map((facet) => (
                      <SelectItem key={facet.value} value={facet.value}>
                        {facet.value} ({facet.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Min Rating filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Minimum Rating
                </label>
                <Select
                  value={queryInput.minRating ? String(queryInput.minRating) : "all"}
                  onValueChange={(val) => updateQueryParam("minRating", val)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Any Rating</SelectItem>
                    {RATING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Availability filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability
                </label>
                <Select
                  value={queryInput.availability || "all"}
                  onValueChange={(val) => updateQueryParam("availability", val)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Min Jobs filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Completed Jobs
                </label>
                <Select
                  value={queryInput.minJobs ? String(queryInput.minJobs) : "all"}
                  onValueChange={(val) => updateQueryParam("minJobs", val)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Any Experience</SelectItem>
                    {MIN_JOBS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Sort By */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sort By
                </label>
                <Select
                  value={queryInput.sortBy || "rating"}
                  onValueChange={(val) => updateQueryParam("sortBy", val)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Top Rated" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1 rounded-xl"
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 rounded-xl font-semibold"
              >
                Apply
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Horizontal Toolbar Above Grid (Desktop & Tablet) */}
      <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card/60 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Skill Filter Select */}
          <Select
            value={queryInput.skill || "all"}
            onValueChange={(val) => updateQueryParam("skill", val)}
          >
            <SelectTrigger
              aria-label="Filter by skill"
              className="w-[170px] rounded-xl bg-background border-border text-xs font-medium"
            >
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-64">
              <SelectItem value="all">All Skills</SelectItem>
              {skillFacets.map((facet) => (
                <SelectItem key={facet.value} value={facet.value}>
                  {facet.value} ({facet.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Min Rating Filter Select */}
          <Select
            value={queryInput.minRating ? String(queryInput.minRating) : "all"}
            onValueChange={(val) => updateQueryParam("minRating", val)}
          >
            <SelectTrigger
              aria-label="Filter by minimum rating"
              className="w-[140px] rounded-xl bg-background border-border text-xs font-medium"
            >
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Rating</SelectItem>
              {RATING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter Select */}
          <Select
            value={queryInput.availability || "all"}
            onValueChange={(val) => updateQueryParam("availability", val)}
          >
            <SelectTrigger
              aria-label="Filter by availability"
              className="w-[150px] rounded-xl bg-background border-border text-xs font-medium"
            >
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Min Jobs Filter Select */}
          <Select
            value={queryInput.minJobs ? String(queryInput.minJobs) : "all"}
            onValueChange={(val) => updateQueryParam("minJobs", val)}
          >
            <SelectTrigger
              aria-label="Filter by completed jobs"
              className="w-[140px] rounded-xl bg-background border-border text-xs font-medium"
            >
              <SelectValue placeholder="Min Jobs" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Any Jobs</SelectItem>
              {MIN_JOBS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Select & Direction Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Sort:</span>
          <Select
            value={queryInput.sortBy || "rating"}
            onValueChange={(val) => updateQueryParam("sortBy", val)}
          >
            <SelectTrigger
              aria-label="Sort mechanics"
              className="w-[160px] rounded-xl bg-background border-border text-xs font-medium"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={queryInput.sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            className="rounded-xl bg-background border-border shrink-0"
            aria-label={`Toggle sort order (currently ${queryInput.sortOrder || "desc"})`}
          >
            <ArrowUpDown className="size-4" />
          </Button>
        </div>
      </div>

      {/* Active Filter Chips & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground font-semibold">{data?.total ?? 0}</strong>{" "}
            certified mechanic{(data?.total ?? 0) === 1 ? "" : "s"}
          </p>

          {/* Active chips */}
          {queryInput.search && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
              Search: &quot;{queryInput.search}&quot;
              <button
                type="button"
                onClick={() => updateQueryParam("search", null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove search filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {queryInput.skill && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
              Skill: {queryInput.skill}
              <button
                type="button"
                onClick={() => updateQueryParam("skill", null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove skill filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {queryInput.minRating && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
              <Star className="size-3 fill-amber-400 text-amber-500" />
              {queryInput.minRating}+ Stars
              <button
                type="button"
                onClick={() => updateQueryParam("minRating", null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove rating filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {queryInput.availability && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
              <CheckCircle2 className="size-3 text-primary" />
              {queryInput.availability}
              <button
                type="button"
                onClick={() => updateQueryParam("availability", null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove availability filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {queryInput.minJobs && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
              <Wrench className="size-3 text-muted-foreground" />
              {queryInput.minJobs}+ Jobs
              <button
                type="button"
                onClick={() => updateQueryParam("minJobs", null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove min jobs filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Clear filters</span>
          </Button>
        )}
      </div>

      {/* Grid Content with Skeleton, Error, and Empty States */}
      {isError ? (
        <ErrorState
          title="Unable to load mechanics"
          description={error?.message || "A network or server error occurred. Please try again."}
          onRetry={() => refetch()}
        />
      ) : isLoading && !data ? (
        <MechanicGrid variant="skeleton" skeletonCount={12} />
      ) : data?.items?.length === 0 ? (
        <EmptyState
          title="No mechanics matched your criteria"
          description="Try broadening your search term or clearing one of the filters to view all available service professionals."
          action={
            hasActiveFilters ? (
              <Button onClick={handleClearFilters} variant="outline" className="rounded-xl">
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <MechanicGrid mechanics={data.items} />

          {/* URL-synced Pagination Component */}
          {data.totalPages > 1 && (
            <div className="pt-4 border-t border-border">
              <UrlPagination
                meta={{
                  page: data.page,
                  limit: data.limit,
                  total: data.total,
                  totalPages: data.totalPages,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
