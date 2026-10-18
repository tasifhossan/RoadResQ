import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerPaymentsLoading() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
