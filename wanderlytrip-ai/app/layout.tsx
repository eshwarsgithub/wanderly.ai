import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WanderlyTrip.ai — Plan Your Entire Trip in Minutes with AI",
  description:
    "WanderlyTrip.ai uses cutting-edge AI to craft your perfect itinerary in minutes. Flights, hotels, restaurants, and activities — all curated to your vibe.",
  keywords: ["AI travel planner", "itinerary generator", "travel AI", "trip planning"],
  manifest: "/manifest.json",
  openGraph: {
    title: "WanderlyTrip.ai",
    description: "Plan your entire trip in minutes with AI.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wanderly",
  },
  other: {
    "theme-color": "#00f5d4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ background: "#F7F3FF", color: "#1A1630" }}>
        {children}
      </body>
    </html>
  );
}
