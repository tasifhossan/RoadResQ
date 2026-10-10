import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerPaymentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
