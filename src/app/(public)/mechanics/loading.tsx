import { MechanicGrid } from "@/components/mechanics/mechanic-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicsLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 sm:h-10 w-72 rounded-xl" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
      </div>

      {/* Search Input Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="hidden sm:flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card/60">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-[170px] rounded-xl" />
          <Skeleton className="h-9 w-[140px] rounded-xl" />
          <Skeleton className="h-9 w-[150px] rounded-xl" />
          <Skeleton className="h-9 w-[140px] rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[160px] rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Active Filter / Counter Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48 rounded-md" />
      </div>

      {/* 12 Skeletons in 4x3 Desktop Grid */}
      <MechanicGrid variant="skeleton" skeletonCount={12} />
    </div>
  );
}
