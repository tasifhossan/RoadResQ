"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface UrlPaginationProps {
  meta: PaginationMeta;
  className?: string;
}

export function UrlPagination({ meta, className }: UrlPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, limit, total, totalPages } = meta;

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    router.push(createPageUrl(newPage));
  };

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2", className)}>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
        <span className="font-semibold text-foreground">{endItem}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span> results
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded-xl gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-xs sm:text-sm font-medium px-2">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
          className="rounded-xl gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
