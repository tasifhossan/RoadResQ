import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicEarningsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
