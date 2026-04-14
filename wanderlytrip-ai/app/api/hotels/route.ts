import { NextRequest, NextResponse } from "next/server";
import { amadeus } from "@/lib/amadeus";
import { getModelForTask } from "@/lib/model-router";
import { parseAIArray } from "@/lib/parse-ai-json";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { HotelOffer } from "@/lib/amadeus";

async function aiHotelFallback(
  cityCode: string,
  checkIn: string,
  checkOut: string,
  adults: number
): Promise<HotelOffer[]> {
  const model = getModelForTask("helper", { maxTokens: 2500, temperature: 0.6 });
  const response = await model.invoke([
    new SystemMessage(
      `You are a hotel data API. Return ONLY a JSON array of 6 realistic hotel offers. Use this exact structure:
[{"hotel":{"hotelId":"HTL001","name":"Grand Plaza Hotel","rating":"4","cityCode":"TYO","address":{"lines":["1-1 Shinjuku"],"cityName":"Tokyo","countryCode":"JP"}},"offers":[{"id":"OFF001","price":{"total":"250.00","currency":"USD"},"room":{"description":{"text":"Deluxe King Room with city view"}},"checkInDate":"2024-05-15","checkOutDate":"2024-05-18"}]}]
Use real-sounding hotel names appropriate for the city. Return raw JSON array only.`
    ),
    new HumanMessage(
      `Generate 6 realistic hotel offers in city ${cityCode} from ${checkIn} to ${checkOut} for ${adults} guest(s). Vary star ratings (3-5 stars), prices, and room types. Return raw JSON array only.`
    ),
  ]);
  return parseAIArray<HotelOffer>(response.content);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cityCode = searchParams.get("cityCode");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = Number(searchParams.get("adults") || "2");

  if (!cityCode || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  // Try Amadeus if credentials are configured
  const hasAmadeus =
    process.env.AMADEUS_CLIENT_ID &&
    process.env.AMADEUS_CLIENT_ID !== "your_amadeus_client_id";

  if (hasAmadeus) {
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
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("credentials not configured")) {
        return NextResponse.json({ error: msg || "Failed to fetch hotels" }, { status: 500 });
      }
    }
  }

  // AI demo fallback when Amadeus is not configured
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Hotel search requires Amadeus API credentials. Get free keys at developers.amadeus.com" },
      { status: 503 }
    );
  }

  try {
    const hotels = await aiHotelFallback(cityCode, checkIn, checkOut, adults);
    return NextResponse.json(hotels, { headers: { "X-Demo-Mode": "1" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate hotel data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
