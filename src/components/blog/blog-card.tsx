import Link from "next/link";
import Image from "next/image";
import { BlogPost, BlogCategory } from "@/content/blog/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogCardProps {
  post: BlogPost;
  className?: string;
  priority?: boolean;
}

export function getCategoryBadgeClasses(category: BlogCategory) {
  switch (category) {
    case "Emergency":
      return "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400";
    case "Safety":
      return "border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-400";
    case "Maintenance":
      return "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function BlogCard({ post, className, priority = false }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      data-slot="blog-card"
      className={cn(
        "group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:border-border/80 hover:shadow-md",
        className
      )}
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted/40">
          <Image
            src={`/api/blog-cover/${post.slug}`}
            alt={post.title}
            fill
            unoptimized
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="outline"
              className={cn("backdrop-blur-md font-semibold text-xs rounded-full px-2.5 py-0.5", getCategoryBadgeClasses(post.category))}
            >
              {post.category}
            </Badge>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-3">
          {/* Metadata: Date and Reading Time */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.publishedAt}>{formattedDate}</time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readingMinutes} min read</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* 2-Line Clamped Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Footer with "Read article" button */}
      <div className="p-5 pt-0">
        <Link href={`/blog/${post.slug}`} className="block w-full">
          <Button
            variant="outline"
            className="w-full justify-between rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-medium"
          >
            <span>Read article</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
