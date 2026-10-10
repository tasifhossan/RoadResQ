import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function RequestDetailNotFound() {
  return (
    <div className="py-12">
      <EmptyState
        title="Service request not found"
        description="The service request ID you are looking for does not exist or you do not have permission to view it."
        action={
          <Link href="/customer/requests">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to My Requests
            </Button>
          </Link>
        }
      />
    </div>
  );
}
