import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getCurrentUser } from "@/lib/auth/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RoadResQ - Roadside Assistance Platform",
    template: "%s | RoadResQ",
  },
  description:
    "On-demand roadside assistance connecting motorists with verified mechanics for instant vehicle rescue, emergency repairs, and towing services.",
  keywords: ["roadside assistance", "mechanic", "emergency repair", "towing", "RoadResQ"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/10 selection:text-primary" suppressHydrationWarning>
        <Providers initialUser={user}>{children}</Providers>
      </body>
    </html>
  );
}
