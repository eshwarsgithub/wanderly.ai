import { NextRequest, NextResponse } from "next/server";
import { amadeus } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cityCode = searchParams.get("cityCode");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = Number(searchParams.get("adults") || "2");

  if (!cityCode || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    const hotels = await amadeus.searchHotels({
      cityCode,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      maxResults: 8,
    });
    return NextResponse.json(hotels);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch hotels";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
