import { NextResponse } from "next/server";
import { getTravelImages } from "@/lib/pexels";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "travel destination";
  const seed = Math.abs(Number(searchParams.get("seed") || "0"));

  // Try Pexels first (PEXELS_API_KEY is set in .env.local)
  const photos = await getTravelImages(query, 15);
  if (photos.length > 0) {
    const photo = photos[seed % photos.length];
    return NextResponse.redirect(photo.src.large);
  }

  // Fallback: loremflickr (no key required)
  const safe = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, " ").trim());
  return NextResponse.redirect(`https://loremflickr.com/800/600/${safe}?random=${seed}`);
}
