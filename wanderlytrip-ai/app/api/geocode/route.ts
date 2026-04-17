import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ coords: null }, { status: 400 });

  const key =
    process.env.GOOGLE_MAPS_SERVER_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return NextResponse.json({ coords: null });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
    );
    const data = await res.json();
    if (data.status === "OK" && data.results[0]) {
      return NextResponse.json({ coords: data.results[0].geometry.location });
    }
  } catch {
    // silent fail
  }
  return NextResponse.json({ coords: null });
}
