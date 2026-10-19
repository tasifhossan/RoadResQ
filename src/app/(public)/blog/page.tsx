import { Metadata } from "next";
import { getAllBlogPosts } from "@/content/blog/posts";
import { BlogClient } from "@/components/blog/blog-client";

export const metadata: Metadata = {
  title: "Emergency Roadside Guides & Safety Blog | RoadResQ",
  description:
    "Expert vehicle safety advice, overheating protocols, battery diagnostic guides, and safe tire changing instructions from the RoadResQ emergency network.",
};

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const posts = getAllBlogPosts();

  const category = resolvedSearchParams.category || "all";
  const search = resolvedSearchParams.search || "";
  const page = Number(resolvedSearchParams.page) || 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Roadside Safety & Guides
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Practical, reliable emergency procedures and vehicle maintenance advice from the RoadResQ team to keep you safe on Bangladesh highways and city roads.
        </p>
      </div>

      {/* Main Interactive Blog Content */}
      <BlogClient
        posts={posts}
        initialCategory={category}
        initialSearch={search}
        initialPage={page}
      />
    </div>
  );
}
