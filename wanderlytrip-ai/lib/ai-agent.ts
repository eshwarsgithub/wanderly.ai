import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { getModelForTask } from "./model-router";
import { normalizeContent } from "./parse-ai-json";
import { getWeatherForecast } from "./weather";
import type { WeatherDay } from "./weather";

// Structured schema for a single activity in the itinerary
export interface Activity {
  id: string;
  time: string;          // e.g. "09:00"
  name: string;
  description: string;
  location: string;
  category: "food" | "activity" | "transport" | "accommodation" | "sightseeing";
  estimatedCost: number; // USD
  currency: string;
  duration: string;      // e.g. "2 hours"
  tips: string;
  imageQuery: string;    // search query for Unsplash placeholder
}

export interface ItineraryDay {
  day: number;
  date: string;          // ISO date string
  theme: string;         // e.g. "Street food & Old Town"
  activities: Activity[];
  dailyCost: number;
  mood: string;          // e.g. "Adventurous & energetic"
  city?: string;         // for multi-destination trips
}

export interface GeneratedItinerary {
  id: string;
  destination: string;
  country: string;
  vibe: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  summary: string;
  highlights: string[];
  days: ItineraryDay[];
  packingTips: string[];
  bestTimeToVisit: string;
  localCustoms: string[];
}

export interface DestinationStop {
  city: string;
  days: number;
}

export interface TripInput {
  destination: string;           // primary / display destination
  destinations?: DestinationStop[]; // multi-destination stops (optional)
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  vibe: string;
}

// ── Zod schemas for runtime validation of AI output ──────────────────────────

const VALID_CATEGORIES = ["food", "activity", "transport", "accommodation", "sightseeing"] as const;
type ActivityCategory = typeof VALID_CATEGORIES[number];

// Map common Gemini synonyms → canonical category
const CATEGORY_MAP: Record<string, ActivityCategory> = {
  food: "food", restaurant: "food", dining: "food", meal: "food", lunch: "food",
  breakfast: "food", dinner: "food", cafe: "food", drink: "food", bar: "food",
  activity: "activity", leisure: "activity", entertainment: "activity", shopping: "activity",
  nature: "activity", adventure: "activity", sport: "activity", recreation: "activity",
  beach: "activity", wellness: "activity", culture: "activity", nightlife: "activity",
  transport: "transport", transit: "transport", travel: "transport", transfer: "transport",
  accommodation: "accommodation", hotel: "accommodation", lodging: "accommodation",
  hostel: "accommodation", stay: "accommodation", checkin: "accommodation",
  sightseeing: "sightseeing", museum: "sightseeing", landmark: "sightseeing",
  cultural: "sightseeing", tour: "sightseeing", historical: "sightseeing",
  temple: "sightseeing", gallery: "sightseeing", monument: "sightseeing",
};

function coerceCategory(val: unknown): ActivityCategory {
  if (typeof val === "string") {
    const key = val.toLowerCase().replace(/[^a-z]/g, "");
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
    // Partial match fallback
    for (const [k, v] of Object.entries(CATEGORY_MAP)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
  }
  return "activity"; // safe default
}

const ActivitySchema = z.object({
  id: z.string(),
  time: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  category: z.preprocess(coerceCategory, z.enum(VALID_CATEGORIES)),
  estimatedCost: z.number(),
  currency: z.string().default("USD"),
  duration: z.string(),
  tips: z.string(),
  imageQuery: z.string(),
});

const ItineraryDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  theme: z.string(),
  activities: z.array(ActivitySchema),
  dailyCost: z.number(),
  mood: z.string(),
  city: z.string().optional(),
});

const GeneratedItinerarySchema = z.object({
  id: z.string(),
  destination: z.string(),
  country: z.string(),
  vibe: z.string(),
  totalDays: z.number(),
  totalBudget: z.number(),
  currency: z.string().default("USD"),
  summary: z.string(),
  highlights: z.array(z.string()),
  days: z.array(ItineraryDaySchema),
  packingTips: z.array(z.string()),
  bestTimeToVisit: z.string(),
  localCustoms: z.array(z.string()),
});

function extractJSON(content: string): string {
  // 1. Strip Gemini/Claude thinking blocks (<thinking>...</thinking>)
  let text = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();

  // 2. Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // 3. Extract the outermost JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  throw new Error("AI returned invalid response format");
}

function parseItineraryJSON(content: string): GeneratedItinerary {
  let jsonStr: string;
  try {
    jsonStr = extractJSON(content);
  } catch {
    throw new Error("AI returned invalid response format");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    // Last resort: try stripping trailing commas (common Gemini quirk)
    try {
      const cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
      raw = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned malformed JSON");
    }
  }

  const result = GeneratedItinerarySchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join(", ");
    throw new Error(`AI response failed validation: ${issues}`);
  }

  return result.data as GeneratedItinerary;
}

const SYSTEM_PROMPT = `You are WanderlyTrip AI, an expert travel curator and trip planner. You craft detailed, realistic, deeply personal itineraries tailored to traveler type, season, budget, and vibe.

CRITICAL: Always respond with ONLY valid JSON matching this exact structure — no markdown, no explanation, just raw JSON:

{
  "id": "unique-id-here",
  "destination": "City, Country",
  "country": "Country",
  "vibe": "the vibe selected",
  "totalDays": number,
  "totalBudget": number,
  "currency": "USD",
  "summary": "2-3 sentence evocative summary of the trip",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "days": [
    {
      "day": 1,
      "date": "2025-06-15",
      "theme": "Arrival & First Impressions",
      "mood": "Excited & exploratory",
      "dailyCost": number,
      "activities": [
        {
          "id": "act-1-1",
          "time": "09:00",
          "name": "Activity Name",
          "description": "Rich, evocative 2-3 sentence description",
          "location": "Specific address or area",
          "category": "activity",
          "estimatedCost": number,
          "currency": "USD",
          "duration": "2 hours",
          "tips": "Local insider tip",
          "imageQuery": "tokyo temple morning"
        }
      ]
    }
  ],
  "packingTips": ["tip1", "tip2", "tip3"],
  "bestTimeToVisit": "Short advice",
  "localCustoms": ["custom1", "custom2"]
}

Core rules:
- Generate 4-6 activities per day (morning, midday, afternoon, evening, night as appropriate)
- estimatedCost is per-person in the trip's local currency; dailyCost is sum of all activities × travelers
- totalBudget must equal sum of all dailyCosts — never exceed the given budget
- Use real, named places (street address or neighbourhood); avoid generic "local restaurant"
- Descriptions should be vivid, sensory, and emotional — sell the experience
- packingTips must be season- and destination-specific (not generic)
- localCustoms should include genuinely useful etiquette — avoid tourist-trap clichés

Traveler persona rules:
- Solo: lean toward flexibility, spontaneity, social hostels/cafes, safety-conscious tips, budget-stretching hacks
- Couple: romantic restaurants, sunset viewpoints, shared experiences, private accommodations
- Small group (3-4): group activity options, shared taxis, split costs, variety of activities to suit different tastes
- Family/large group (5+): kid-friendly venues, logical routing to minimise fatigue, rest breaks

Vibe-specific tone:
- adventure: hikes, water sports, extreme activities, early starts, nature; push physical limits
- cultural: museums, heritage sites, local festivals, art galleries, architecture walks; depth over breadth
- relaxation: spas, beach time, slow mornings, lounges, scenic cafes; never over-schedule
- foodie: market tours, tasting menus, street food trails, cooking classes, chef-owned restaurants
- party: rooftop bars, nightclubs, sunset cocktails, music venues; afternoon recovery built in
- romantic: candlelit dinners, private boat tours, sunrise spots, couples massages, secluded beaches
- budget: free museums, happy hours, street food, public transport, free walking tours; maximise value

Season awareness:
- Adjust outdoor activities, clothing recommendations in packingTips, and bestTimeToVisit context based on the travel season
- Flag seasonal closures, festivals, or weather risks in tips`;

function buildWeatherContext(weather: WeatherDay[]): string {
  if (!weather.length) return "";
  const lines = weather.map((w) =>
    `  ${w.date}: ${w.description}, ${w.tempLowC}–${w.tempHighC}°C, ${w.precipitationChance}% rain`
  );
  return `\n\nLive weather forecast (adjust outdoor activities and tips accordingly):\n${lines.join("\n")}`;
}

function getSeason(date: Date): string {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

function getTravelerPersona(count: number): string {
  if (count === 1) return "solo traveler";
  if (count === 2) return "couple";
  if (count <= 4) return "small group";
  return "family / large group";
}

export async function generateItinerary(input: TripInput): Promise<GeneratedItinerary> {
  const model = getModelForTask("main-itinerary", { maxTokens: 16000, temperature: 0.8 });

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const isMultiDestination = input.destinations && input.destinations.length > 1;
  const destinationDesc = isMultiDestination
    ? input.destinations!.map((d) => `${d.days} days in ${d.city}`).join(", then ")
    : `${days} days in ${input.destination}`;

  const cityFieldNote = isMultiDestination
    ? `\n- Each day object must include a "city" field indicating which city that day is in.`
    : "";

  const season = getSeason(startDate);
  const persona = getTravelerPersona(input.travelers);
  const perPerson = Math.round(input.budget / Math.max(input.travelers, 1));

  // Fetch live weather if trip is within forecast window (silent fail)
  const weatherDays = await getWeatherForecast(input.destination, input.startDate, days).catch(() => [] as WeatherDay[]);
  const weatherContext = buildWeatherContext(weatherDays);

  const userPrompt = `Plan a ${input.vibe} trip: ${destinationDesc}.

Trip context:
- Dates: ${input.startDate} to ${input.endDate} (${season} travel)
- Total days: ${days}
- Travelers: ${input.travelers} (${persona})
- Total budget: $${input.budget} USD ($${perPerson}/person)
- Vibe: ${input.vibe}${cityFieldNote}${weatherContext}

Apply persona-appropriate activity choices, season-aware packing tips, and vibe-specific tone throughout.
Generate the complete itinerary JSON now.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content = normalizeContent(response.content);
  const itinerary = parseItineraryJSON(content);

  if (!itinerary.id) {
    itinerary.id = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  return itinerary;
}

// Refine the itinerary based on a chat message
export async function refineItinerary(
  itinerary: GeneratedItinerary,
  userRequest: string
): Promise<GeneratedItinerary> {
  const model = getModelForTask("refinement", { maxTokens: 8000, temperature: 0.7 });

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Here is the current itinerary JSON:\n${JSON.stringify(itinerary, null, 2)}\n\nUser request: "${userRequest}"\n\nConstraint: The total cost of all activities must not exceed the original budget of $${itinerary.totalBudget} USD. Adjust activity costs accordingly.\n\nApply the changes and return the updated complete itinerary JSON.`
    ),
  ]);

  const content = normalizeContent(response.content);
  return parseItineraryJSON(content);
}

// Parse natural language into partial TripInput fields
export async function parseNaturalLanguage(text: string): Promise<Partial<TripInput>> {
  const model = getModelForTask("helper", { maxTokens: 512, temperature: 0 });

  const response = await model.invoke([
    new SystemMessage(
      `Extract trip planning details from the user's text. Return ONLY a JSON object with any of these optional fields: destination, startDate (ISO), endDate (ISO), budget (number), travelers (number), vibe. Omit fields not mentioned.`
    ),
    new HumanMessage(text),
  ]);

  try {
    const { parseAIObject } = await import("./parse-ai-json");
    return parseAIObject<Partial<TripInput>>(response.content);
  } catch {
    return {};
  }
}

// Get alternative activities for a specific slot in the itinerary
export async function getActivityAlternatives(
  itinerary: GeneratedItinerary,
  dayIndex: number,
  activityId: string
): Promise<Activity[]> {
  const model = getModelForTask("helper", { maxTokens: 2000, temperature: 0.9 });

  const day = itinerary.days[dayIndex];
  const activity = day?.activities.find((a) => a.id === activityId);
  if (!activity) return [];

  const response = await model.invoke([
    new SystemMessage(
      `You are WanderlyTrip AI. Return ONLY a JSON array of 3 alternative activities for the given slot. Each must match the Activity schema exactly (same fields as the original). No markdown, just raw JSON array.`
    ),
    new HumanMessage(
      `Destination: ${itinerary.destination}. Vibe: ${itinerary.vibe}. Day ${day.day} (${day.theme}). Replace this activity: ${JSON.stringify(activity)}. Budget per activity: ~$${activity.estimatedCost} USD. Return 3 alternatives as a JSON array.`
    ),
  ]);

  try {
    const { parseAIArray } = await import("./parse-ai-json");
    return parseAIArray<Activity>(response.content);
  } catch {
    return [];
  }
}
