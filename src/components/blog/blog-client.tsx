"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BlogPost } from "@/content/blog/types";
import { BLOG_CATEGORIES } from "@/content/blog/posts";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, RotateCcw, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogClientProps {
  posts: BlogPost[];
  initialCategory?: string;
  initialSearch?: string;
  initialPage?: number;
}

const POSTS_PER_PAGE = 6;

export function BlogClient({
  posts,
  initialCategory = "all",
  initialSearch = "",
  initialPage = 1,
}: BlogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || initialCategory;
  const currentSearch = searchParams.get("search") || initialSearch;
  const currentPage = Number(searchParams.get("page")) || initialPage;

  // Filter posts based on URL parameters
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      !currentCategory ||
      currentCategory === "all" ||
      post.category.toLowerCase() === currentCategory.toLowerCase();

    const matchesSearch =
      !currentSearch.trim() ||
      post.title.toLowerCase().includes(currentSearch.toLowerCase().trim()) ||
      post.excerpt.toLowerCase().includes(currentSearch.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  // Calculate pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Update URL helper
  const updateQuery = (updates: { category?: string | null; search?: string | null; page?: number | null }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.category !== undefined) {
      if (!updates.category || updates.category === "all") {
        params.delete("category");
      } else {
        params.set("category", updates.category);
      }
      params.delete("page"); // Reset to page 1 on filter change
    }

    if (updates.search !== undefined) {
      if (!updates.search || !updates.search.trim()) {
        params.delete("search");
      } else {
        params.set("search", updates.search.trim());
      }
      params.delete("page"); // Reset to page 1 on search change
    }

    if (updates.page !== undefined) {
      if (!updates.page || updates.page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(updates.page));
      }
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    (currentCategory && currentCategory !== "all") ||
    Boolean(currentSearch.trim());

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        {/* Title Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search guides by title..."
            value={currentSearch}
            onChange={(e) => updateQuery({ search: e.target.value })}
            className="pl-10 pr-9 rounded-xl h-10 border-input"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => updateQuery({ search: null })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateQuery({ category: "all" })}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              !currentCategory || currentCategory === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All Articles ({posts.length})
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => updateQuery({ category: cat.toLowerCase() })}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span>Filtering by:</span>
            {currentCategory && currentCategory !== "all" && (
              <Badge variant="outline" className="gap-1 rounded-full pl-2 pr-1">
                <span className="capitalize">{currentCategory}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null })}
                  className="hover:text-foreground ml-1"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentSearch.trim() && (
              <Badge variant="outline" className="gap-1 rounded-full pl-2 pr-1">
                <span>&ldquo;{currentSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ search: null })}
                  className="hover:text-foreground ml-1"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <span>({totalPosts} {totalPosts === 1 ? "article" : "articles"} found)</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {paginatedPosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No articles found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No roadside guides match your current filter criteria. Try adjusting your search term or selecting another category.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="rounded-xl"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      ) : (
        /* 3-per-row Desktop Grid of Identical-size Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} priority={index < 3} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => updateQuery({ page: safePage - 1 })}
            className="rounded-xl gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-1 px-2 text-sm text-muted-foreground font-medium">
            <span>Page</span>
            <span className="font-semibold text-foreground">{safePage}</span>
            <span>of</span>
            <span className="font-semibold text-foreground">{totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => updateQuery({ page: safePage + 1 })}
            className="rounded-xl gap-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
