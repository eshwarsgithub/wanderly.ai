import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const type = (searchParams.get("type") ?? "tourist_attraction").split("|")[0];
  const radius = searchParams.get("radius") ?? "1500";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return NextResponse.json({ places: [] });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius);
    url.searchParams.set("type", type);
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    if (!res.ok) return NextResponse.json({ places: [] });

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const places = (data.results ?? []).slice(0, 12).map((p: any) => ({
      id: p.place_id as string,
      name: p.name as string,
      address: (p.vicinity ?? "") as string,
      rating: (p.rating ?? null) as number | null,
      types: (p.types ?? []) as string[],
      lat: p.geometry.location.lat as number,
      lng: p.geometry.location.lng as number,
    }));

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [] });
  }
}
