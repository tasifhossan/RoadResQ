import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicRequestsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}
