import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
}
