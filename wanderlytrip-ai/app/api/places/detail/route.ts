import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return NextResponse.json({ detail: null });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set(
      "fields",
      "name,formatted_address,rating,opening_hours,photos,editorial_summary,types"
    );
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    if (!res.ok) return NextResponse.json({ detail: null });

    const data = await res.json();
    const r = data.result;
    if (!r) return NextResponse.json({ detail: null });

    return NextResponse.json({
      detail: {
        id: placeId,
        name: r.name ?? "",
        address: r.formatted_address ?? "",
        rating: r.rating ?? null,
        openNow: r.opening_hours?.open_now ?? null,
        summary: r.editorial_summary?.overview ?? "",
        types: r.types ?? [],
        photoRef: r.photos?.[0]?.photo_reference ?? null,
      },
    });
  } catch {
    return NextResponse.json({ detail: null });
  }
}
