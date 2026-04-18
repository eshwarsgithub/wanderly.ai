import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIArray } from "@/lib/parse-ai-json";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const RestaurantSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]),
  rating: z.number().min(1).max(5),
  neighborhood: z.string(),
  mustTry: z.string(),
  vibe: z.string(),
  tip: z.string(),
  photoUrl: z.string().optional(),
  googleMapsUrl: z.string().optional(),
});

const RestaurantArraySchema = z.array(RestaurantSchema);

const PRICE_MAP: Record<number, "$" | "$$" | "$$$" | "$$$$"> = {
  0: "$", 1: "$", 2: "$$", 3: "$$$", 4: "$$$$",
};

async function fetchGooglePlaces(destination: string): Promise<z.infer<typeof RestaurantSchema>[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("No Google Places API key");

  // Text search for restaurants in destination
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=best+restaurants+in+${encodeURIComponent(destination)}&type=restaurant&key=${key}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error("Google Places search failed");

  const data = await searchRes.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places error: ${data.status}`);
  }

  const places = (data.results ?? []).slice(0, 8);
  return places.map((p: {
    name?: string;
    types?: string[];
    price_level?: number;
    rating?: number;
    formatted_address?: string;
    place_id?: string;
    photos?: Array<{ photo_reference: string }>;
  }) => {
    const photoRef = p.photos?.[0]?.photo_reference;
    const photoUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${key}`
      : undefined;

    // Derive cuisine from place types
    const typeMap: Record<string, string> = {
      bakery: "Bakery", bar: "Bar & Bites", cafe: "Café",
      meal_delivery: "Delivery", meal_takeaway: "Takeaway",
      night_club: "Late Night", food: "Local Cuisine",
    };
    const cuisine = p.types?.map((t: string) => typeMap[t]).find(Boolean) ?? "Restaurant";

    // Extract neighbourhood from address
    const addrParts = (p.formatted_address ?? "").split(",");
    const neighborhood = addrParts[1]?.trim() ?? addrParts[0]?.trim() ?? destination;

    return {
      name: p.name ?? "Restaurant",
      cuisine,
      priceRange: PRICE_MAP[p.price_level ?? 2],
      rating: Math.round((p.rating ?? 4) * 10) / 10,
      neighborhood,
      mustTry: "Ask the staff for today's special",
      vibe: "Local favourite",
      tip: "Book ahead on weekends",
      photoUrl,
      googleMapsUrl: p.place_id
        ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
        : undefined,
    };
  });
}

async function fetchAIRestaurants(destination: string): Promise<z.infer<typeof RestaurantSchema>[]> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  const model = getModelForTask("helper", { maxTokens: 2000, temperature: 0.7 });
  const response = await model.invoke([
    new SystemMessage(
      `You are a food critic and travel expert. Return ONLY valid JSON — an array of 6 restaurant recommendations. Each object must have: name, cuisine, priceRange ($|$$|$$$|$$$$), rating (1.0-5.0 number), neighborhood, mustTry, vibe, tip.`
    ),
    new HumanMessage(`Give me the 6 best restaurants in ${destination}. Return raw JSON array only, no markdown.`),
  ]);

  const parsed = parseAIArray(response.content);
  const result = RestaurantArraySchema.safeParse(parsed);
  if (!result.success) throw new Error("Invalid restaurant data from AI");
  return result.data;
}

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }

  const destination = req.nextUrl.searchParams.get("destination");
  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  try {
    // Try Google Places first, fall back to Claude AI
    const restaurants = await fetchGooglePlaces(destination).catch(() => fetchAIRestaurants(destination));
    return NextResponse.json(restaurants);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to get restaurant recommendations";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
