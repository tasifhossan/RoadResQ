import { Skeleton } from "@/components/ui/skeleton";

export default function MechanicLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <Skeleton className="h-4 w-96 rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
