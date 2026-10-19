import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Profile | RoadResQ",
  description: "Administrator profile settings and account information.",
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administrator account profile settings and session security.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-4 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Administrator</h2>
            <p className="text-xs text-muted-foreground">Full system access & platform governance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
