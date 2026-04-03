import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

interface RestaurantResult {
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  neighborhood: string;
  mustTry: string;
  vibe: string;
  tip: string;
  photoUrl?: string;
  placeId?: string;
}

// Fallback: generate restaurants via Claude when Google Places is unavailable
async function generateFakeRestaurants(destination: string): Promise<RestaurantResult[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-haiku-4-5-20251001",
    maxTokens: 2000,
    temperature: 0.7,
  });
  const response = await model.invoke([
    new SystemMessage(
      `You are a food critic and travel expert. Return ONLY valid JSON — an array of 6 restaurant recommendations. Each object must have: name, cuisine, priceRange ($|$$|$$$|$$$$), rating (1-5 integer), neighborhood, mustTry, vibe, tip.`
    ),
    new HumanMessage(`Give me the 6 best restaurants in ${destination}. Return raw JSON array only, no markdown.`),
  ]);
  try {
    const content = response.content as string;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as RestaurantResult[];
  } catch {
    return [];
  }
}

function priceLevelToRange(level: number | undefined): string {
  if (level === undefined || level === null) return "$$";
  return ["$", "$", "$$", "$$$", "$$$$"][Math.min(level, 4)] ?? "$$";
}

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination");

  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Use Google Places if API key is available
  if (googleKey) {
    try {
      // Step 1: Geocode destination
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${googleKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      const location = geoData.results?.[0]?.geometry?.location;

      if (location) {
        // Step 2: Nearby Search for restaurants
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=2000&type=restaurant&rankby=prominence&key=${googleKey}`;
        const nearbyRes = await fetch(nearbyUrl);
        const nearbyData = await nearbyRes.json();

        const places = (nearbyData.results ?? []).slice(0, 6);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const restaurants: RestaurantResult[] = places.map((p: any) => {
          const photoRef = p.photos?.[0]?.photo_reference;
          const photoUrl = photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${googleKey}`
            : undefined;

          // Determine cuisine from types array
          const typeMap: Record<string, string> = {
            japanese_restaurant: "Japanese",
            chinese_restaurant: "Chinese",
            italian_restaurant: "Italian",
            french_restaurant: "French",
            mexican_restaurant: "Mexican",
            indian_restaurant: "Indian",
            thai_restaurant: "Thai",
            seafood_restaurant: "Seafood",
            steakhouse: "Steakhouse",
            pizza_restaurant: "Pizza",
            sushi_restaurant: "Sushi",
            ramen_restaurant: "Ramen",
          };
          const types: string[] = p.types ?? [];
          const cuisine = types.reduce((c: string, t: string) => typeMap[t] ?? c, "Restaurant");

          return {
            name: p.name,
            cuisine,
            priceRange: priceLevelToRange(p.price_level),
            rating: Math.round(p.rating ?? 4),
            neighborhood: p.vicinity ?? destination,
            mustTry: "Explore their seasonal menu",
            vibe: p.editorial_summary?.overview ?? (p.opening_hours?.open_now ? "Open now" : "Check hours"),
            tip: p.opening_hours?.open_now !== undefined
              ? p.opening_hours.open_now ? "Currently open" : "Currently closed — check hours"
              : "Check opening hours before visiting",
            photoUrl,
            placeId: p.place_id,
          };
        });

        return NextResponse.json(restaurants);
      }
    } catch {
      // Fall through to Claude fallback
    }
  }

  // Fallback to Claude-generated restaurants
  const restaurants = await generateFakeRestaurants(destination);
  if (restaurants.length === 0 && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
  }
  return NextResponse.json(restaurants);
}
