import { ImageResponse } from "next/og";
import { getAllBlogPosts, getBlogPostBySlug } from "@/content/blog/posts";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteProps
): Promise<Response> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.title || "Roadside Assistance Guide";
  const readingMinutes = post?.readingMinutes || 4;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Header: Brand & Category Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#60a5fa",
              }}
            >
              RoadResQ
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#94a3b8",
              }}
            >
              / Guide
            </div>
          </div>
        </div>

        {/* Center: Article Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#f8fafc",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: Metadata & Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: 18,
              color: "#cbd5e1",
            }}
          >
            <span>RoadResQ Team</span>
            <span>•</span>
            <span>{readingMinutes} min read</span>
          </div>

          <div
            style={{
              fontSize: 16,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            roadresq.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
