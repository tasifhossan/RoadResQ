import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerVehiclesLoading() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:max-w-md rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
