import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function MechanicRequestDetailNotFound() {
  return (
    <div className="py-12">
      <EmptyState
        title="Job not found"
        description="The assigned job ID you are looking for does not exist or you do not have permission to view it."
        action={
          <Link href="/mechanic/requests">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Assigned Jobs
            </Button>
          </Link>
        }
      />
    </div>
  );
}
