import { NextRequest, NextResponse } from "next/server";
import { amadeus } from "@/lib/amadeus";
import { getModelForTask } from "@/lib/model-router";
import { parseAIArray } from "@/lib/parse-ai-json";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { FlightOffer } from "@/lib/amadeus";

async function aiFlightFallback(
  origin: string,
  destination: string,
  date: string,
  adults: number
): Promise<FlightOffer[]> {
  const model = getModelForTask("helper", { maxTokens: 2000, temperature: 0.6 });
  const response = await model.invoke([
    new SystemMessage(
      `You are a flight data API. Return ONLY a JSON array of 6 realistic flight offers. Use this exact structure:
[{"id":"1","price":{"total":"850.00","currency":"USD"},"itineraries":[{"duration":"PT14H30M","segments":[{"departure":{"iataCode":"JFK","at":"2024-05-15T10:00:00"},"arrival":{"iataCode":"NRT","at":"2024-05-16T14:30:00"},"carrierCode":"JL","number":"004"}]}],"numberOfBookableSeats":12}]
Use real airline codes (AA, UA, DL, BA, JL, EK, SQ, QR, LH, AF etc), realistic prices and flight durations. Duration format: PT14H30M. Return raw JSON array only.`
    ),
    new HumanMessage(
      `Generate 6 realistic flight offers from ${origin} to ${destination} on ${date} for ${adults} adult(s). Vary the prices, airlines, and departure times. Return raw JSON array only.`
    ),
  ]);
  return parseAIArray<FlightOffer>(response.content);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const adults = Number(searchParams.get("adults") || "1");

  if (!origin || !destination || !date) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  // Try Amadeus if credentials are configured
  const hasAmadeus =
    process.env.AMADEUS_CLIENT_ID &&
    process.env.AMADEUS_CLIENT_ID !== "your_amadeus_client_id";

  if (hasAmadeus) {
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
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("credentials not configured")) {
        return NextResponse.json({ error: msg || "Failed to fetch flights" }, { status: 500 });
      }
    }
  }

  // AI demo fallback when Amadeus is not configured
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Flight search requires Amadeus API credentials. Get free keys at developers.amadeus.com" },
      { status: 503 }
    );
  }

  try {
    const flights = await aiFlightFallback(origin, destination, date, adults);
    return NextResponse.json(flights, { headers: { "X-Demo-Mode": "1" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate flight data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
