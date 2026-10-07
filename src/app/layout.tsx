import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | RoadResQ",
  },
  description: siteConfig.description,
  keywords: [
    "roadside assistance",
    "mechanic dispatch",
    "emergency repair",
    "towing service",
    "spare parts invoice",
    "SSLCommerz test payment",
    "RoadResQ",
  ],
  authors: [{ name: "Tasif Hossan", url: siteConfig.links.githubProfile }],
  creator: "Tasif Hossan",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/10 selection:text-primary" suppressHydrationWarning>
        <Providers initialUser={null}>{children}</Providers>
      </body>
    </html>
  );
}
