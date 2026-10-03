import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function PaymentLoading() {
  return (
    <div className="container max-w-xl mx-auto py-12 px-4 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full text-center shadow-lg">
        <CardHeader className="flex flex-col items-center pb-2">
          <Skeleton className="w-16 h-16 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3 py-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </CardFooter>
      </Card>
    </div>
  );
}
