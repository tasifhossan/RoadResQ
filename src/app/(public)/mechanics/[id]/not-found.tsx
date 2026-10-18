import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MechanicNotFound() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex items-center justify-center">
      <div className="card-base max-w-md w-full rounded-xl border border-border bg-card p-8 text-center shadow-sm space-y-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserX className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Mechanic not found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The mechanic profile you are looking for does not exist, has been removed, or is currently inactive.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/mechanics"
            className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-xl gap-2 font-medium")}
          >
            <ArrowLeft className="size-4" />
            <span>Back to all mechanics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
