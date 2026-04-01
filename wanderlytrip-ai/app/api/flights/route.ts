import { NextRequest, NextResponse } from "next/server";
import { amadeus } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const adults = Number(searchParams.get("adults") || "1");

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    const flights = await amadeus.searchFlights({
      originCode: origin,
      destinationCode: destination,
      departureDate: date,
      adults,
      maxResults: 8,
    });
    return NextResponse.json(flights);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch flights";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
