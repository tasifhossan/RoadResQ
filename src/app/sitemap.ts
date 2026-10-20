import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllBlogPosts } from "@/content/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const lastModified = new Date();

  const staticPublicRoutes = [
    "",
    "/assistant",
    "/mechanics",
    "/how-it-works",
    "/blog",
    "/about",
    "/faq",
    "/contact",
    "/support",
    "/privacy",
    "/terms",
    "/login",
    "/register",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPublicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const blogPosts = getAllBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
