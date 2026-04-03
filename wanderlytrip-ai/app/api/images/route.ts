import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "travel destination";
  const seed = Math.abs(Number(searchParams.get("seed") || "1"));

  const apiKey = process.env.PEXELS_API_KEY;

  // Fallback to loremflickr if no Pexels key configured
  if (!apiKey) {
    const safe = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, " ").trim());
    return NextResponse.redirect(`https://loremflickr.com/400/300/${safe}?random=${seed}`);
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=1`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 86400 }, // cache for 24h
      }
    );

    if (!res.ok) throw new Error("Pexels API error");

    const data = await res.json();
    const photos: Array<{ src: { medium: string } }> = data.photos ?? [];

    if (photos.length === 0) throw new Error("No photos found");

    const photo = photos[seed % photos.length];
    return NextResponse.redirect(photo.src.medium);
  } catch {
    // Graceful fallback
    const safe = encodeURIComponent(query.replace(/[^a-zA-Z0-9 ]/g, " ").trim());
    return NextResponse.redirect(`https://loremflickr.com/400/300/${safe}?random=${seed}`);
  }
}
