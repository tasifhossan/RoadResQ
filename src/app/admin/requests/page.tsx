import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Service Requests | Admin | RoadResQ",
  description: "Platform-wide service request management for RoadResQ administrators.",
};

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and status monitoring for all platform roadside emergency requests.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">All Requests Monitor</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Live request oversight and filtering interface. Administrative actions for active dispatches are managed here.
        </p>
      </div>
    </div>
  );
}
