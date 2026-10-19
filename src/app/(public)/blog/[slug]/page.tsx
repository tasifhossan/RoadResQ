import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/content/blog/posts";
import { BlogCard, getCategoryBadgeClasses } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  Share2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | RoadResQ Blog",
    };
  }

  const ogImageUrl = `${siteConfig.url}/api/blog-cover/${post.slug}`;

  return {
    title: `${post.title} | RoadResQ Blog`,
    description: post.excerpt,
    authors: [{ name: "RoadResQ Team" }],
    openGraph: {
      title: `${post.title} | RoadResQ Blog`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["RoadResQ Team"],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}

function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">
          {post.title}
        </span>
      </nav>

      {/* Article Header Container */}
      <header className="mb-8 space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn("font-semibold text-xs rounded-full px-3 py-1", getCategoryBadgeClasses(post.category))}
          >
            {post.category}
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          {post.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed pt-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-y border-border py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-foreground">RoadResQ Team</span>
              <span className="block text-[11px] text-muted-foreground">Roadside Safety & Technical Editorial</span>
            </div>
          </div>
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Guides</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Grid: Content + Sidebar TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Body (8 cols on lg) */}
        <main className="lg:col-span-8 space-y-8">
          {/* Cover Hero Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border shadow-sm bg-muted/40">
            <Image
              src={`/api/blog-cover/${post.slug}`}
              alt={post.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
            />
          </div>

          {/* Mobile Table of Contents (visible on smaller screens) */}
          <div className="lg:hidden rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>In this guide</span>
            </div>
            <nav className="space-y-1.5">
              {post.sections.map((section, idx) => (
                <a
                  key={section.heading}
                  href={`#${slugifyHeading(section.heading)}`}
                  className="block text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  <span className="font-semibold text-primary/80 mr-1.5">{idx + 1}.</span>
                  {section.heading}
                </a>
              ))}
            </nav>
          </div>

          {/* Sections Content */}
          <div className="space-y-10 text-foreground">
            {post.sections.map((section, idx) => {
              const anchorId = slugifyHeading(section.heading);
              return (
                <section key={section.heading} id={anchorId} className="scroll-m-24 space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/60 pb-2">
                    <span className="text-primary font-mono text-lg mr-2 font-semibold">
                      0{idx + 1}.
                    </span>
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-base text-muted-foreground leading-relaxed">
                      {para}
                    </p>
                  ))}

                  {section.list && section.list.length > 0 && (
                    <ul className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2.5 my-4">
                      {section.list.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-2.5 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          {/* Emergency Call-out Box */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Stranded on the Road Right Now?</h3>
                <p className="text-xs text-muted-foreground">Find real mechanics near your breakdown coordinates.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If your vehicle is inoperable or you are unsafe on the roadway, don&apos;t risk further engine damage or personal injury. Submit a service request to browse available technicians in your district.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/customer/requests/new">
                <Button className="rounded-xl">
                  Request Emergency Help
                </Button>
              </Link>
              <Link href="/mechanics">
                <Button variant="outline" className="rounded-xl">
                  View Available Mechanics
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Sticky Sidebar on Desktop (4 cols on lg) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Table of Contents</span>
            </div>

            <nav className="space-y-1.5 text-sm">
              {post.sections.map((section, idx) => (
                <a
                  key={section.heading}
                  href={`#${slugifyHeading(section.heading)}`}
                  className="block text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-muted/50"
                >
                  <span className="font-mono text-primary font-bold mr-1.5">{idx + 1}.</span>
                  {section.heading}
                </a>
              ))}
            </nav>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Published by RoadResQ</p>
              <p>Practical and cautious roadside knowledge designed for safety on Bangladesh roads.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Related Roadside Guides
              </h2>
              <p className="text-sm text-muted-foreground">
                Continue reading practical vehicle safety and maintenance instructions.
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="sm" className="rounded-xl">
                View all articles
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
