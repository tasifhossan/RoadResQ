import { MechanicCardSkeleton } from "@/components/mechanics/mechanic-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicDetailLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-sm" />
        <Skeleton className="h-4 w-3 rounded-sm" />
        <Skeleton className="h-4 w-20 rounded-sm" />
        <Skeleton className="h-4 w-3 rounded-sm" />
        <Skeleton className="h-4 w-28 rounded-sm" />
      </div>

      {/* Header Profile Card Skeleton */}
      <div className="card-base rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Skeleton className="size-24 sm:size-28 md:size-32 rounded-xl shrink-0" />
          <div className="space-y-3 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-56 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-4 w-28 rounded-sm" />
              <Skeleton className="h-4 w-32 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Main Column (span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Skeleton */}
          <div className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
          </div>

          {/* Key Information Skeleton */}
          <div className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <Skeleton className="h-6 w-40 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>

          {/* Reviews & Ratings Skeleton */}
          <div className="card-base rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <Skeleton className="h-6 w-44 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="sm:col-span-2 space-y-2">
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sticky Side Card Column */}
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>

      {/* Related Mechanics Skeleton */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MechanicCardSkeleton />
          <MechanicCardSkeleton />
          <MechanicCardSkeleton />
          <MechanicCardSkeleton />
        </div>
      </div>
    </div>
  );
}
