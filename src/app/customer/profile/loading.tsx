import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerProfileLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl md:col-span-1" />
        <Skeleton className="h-96 rounded-2xl md:col-span-2" />
      </div>
    </div>
  );
}
