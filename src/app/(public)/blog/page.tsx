import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | RoadResQ",
  description: "Articles, maintenance tips, and product updates from the RoadResQ team.",
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Articles, vehicle maintenance tips, and platform updates from the RoadResQ roadside network.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Stories & Guides Coming Soon</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We are preparing detailed emergency guides and platform development updates. Check back soon for our first published posts.
        </p>
        <div className="pt-2">
          <Link href="/mechanics">
            <Button variant="outline" className="rounded-xl">
              Browse Available Mechanics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
