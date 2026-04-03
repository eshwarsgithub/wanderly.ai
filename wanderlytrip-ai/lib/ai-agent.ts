import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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
  imageQuery: string;    // search query for image lookup
}

export interface ItineraryDay {
  day: number;
  date: string;          // ISO date string
  theme: string;         // e.g. "Street food & Old Town"
  activities: Activity[];
  dailyCost: number;
  mood: string;          // e.g. "Adventurous & energetic"
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

export type TravelerPersona = "solo" | "couple" | "family" | "group";

export interface TripInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  vibe: string;
  persona: TravelerPersona;
  avoidTouristTraps: boolean;
  dietaryRestrictions?: string[];
  weather?: WeatherDay[];
}

const SYSTEM_PROMPT = `You are WanderlyTrip AI, an expert travel planner. When given trip details, you generate a detailed, realistic, and exciting travel itinerary.

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

Rules:
- Generate 4-6 activities per day (morning, midday, afternoon, evening)
- Keep costs realistic for the budget provided
- Match activities to the requested vibe
- Be specific about locations (real places)
- Make descriptions vivid and emotional — sell the experience
- totalBudget should be the sum of all daily costs

Persona guidance:
- solo: efficient pacing, budget-conscious, solo-friendly venues, mix of social + private experiences
- couple: romantic touches, private dining options, sunset spots, intimate activities
- family: child-friendly alternatives always included, practical timings, easy transit between spots
- group: flexible timing, group discount awareness, mix of group activities and free time`;

export async function generateItinerary(input: TripInput): Promise<GeneratedItinerary> {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-6",
    maxTokens: 8000,
    temperature: 0.8,
  });

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Compute contextual enrichments
  const month = startDate.getMonth();
  const season = month <= 1 || month === 11 ? "winter"
    : month <= 4 ? "spring"
    : month <= 7 ? "summer" : "fall";
  const perPersonBudget = Math.round(input.budget / input.travelers);

  let weatherContext = "";
  if (input.weather && input.weather.length > 0) {
    const lines = input.weather.slice(0, days).map((w) =>
      `  - ${w.date}: High ${w.tempHighC}°C / Low ${w.tempLowC}°C, ${w.description}, ${w.precipitationChance}% rain chance`
    );
    weatherContext = `\nWeather forecast:\n${lines.join("\n")}\nAdapt outdoor activities, clothing tips, and indoor alternatives based on this forecast.`;
  }

  const dietaryNote = input.dietaryRestrictions && input.dietaryRestrictions.length > 0
    ? `\nDietary restrictions: ${input.dietaryRestrictions.join(", ")} — ensure food recommendations respect these.`
    : "";

  const touristTrapNote = input.avoidTouristTraps
    ? "\nAvoid obvious tourist traps — favor local haunts, neighborhood spots, and experiences that feel authentic over mass-tourism venues."
    : "";

  const userPrompt = `Plan a ${days}-day ${input.vibe} trip to ${input.destination}.
- Dates: ${input.startDate} to ${input.endDate}
- Budget: $${input.budget} USD total ($${perPersonBudget}/person) for ${input.travelers} traveler(s)
- Vibe: ${input.vibe}
- Season: ${season}
- Traveler persona: ${input.persona}${touristTrapNote}${dietaryNote}${weatherContext}

Generate the complete itinerary JSON now.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI returned invalid response format");
  }

  const itinerary = JSON.parse(jsonMatch[0]) as GeneratedItinerary;

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
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-6",
    maxTokens: 8000,
    temperature: 0.7,
  });

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Here is the current itinerary JSON:\n${JSON.stringify(itinerary, null, 2)}\n\nUser request: "${userRequest}"\n\nApply the changes and return the updated complete itinerary JSON.`
    ),
  ]);

  const content = response.content as string;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid response format");

  return JSON.parse(jsonMatch[0]) as GeneratedItinerary;
}

// Parse natural language trip description into partial TripInput
export async function parseNaturalLanguage(text: string): Promise<Partial<TripInput>> {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-haiku-4-5-20251001",
    maxTokens: 500,
    temperature: 0.2,
  });

  const today = new Date().toISOString().split("T")[0];

  const response = await model.invoke([
    new SystemMessage(
      `Extract structured trip data from natural language. Return ONLY valid JSON with any fields you can confidently extract. Omit fields you cannot determine. Today is ${today}.

JSON schema (all fields optional):
{
  "destination": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budget": number,
  "travelers": number,
  "vibe": "one of: adventure|culture|food|relaxation|romantic|luxury|chill",
  "persona": "one of: solo|couple|family|group",
  "avoidTouristTraps": boolean
}

Return raw JSON only, no markdown.`
    ),
    new HumanMessage(text),
  ]);

  try {
    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    return JSON.parse(jsonMatch[0]) as Partial<TripInput>;
  } catch {
    return {};
  }
}

// Get 3 alternative activities for a given time slot
export async function getActivityAlternatives(
  itinerary: GeneratedItinerary,
  dayIndex: number,
  activityId: string
): Promise<Activity[]> {
  const day = itinerary.days[dayIndex];
  const activity = day?.activities.find((a) => a.id === activityId);
  if (!activity) return [];

  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-haiku-4-5-20251001",
    maxTokens: 2000,
    temperature: 0.8,
  });

  const response = await model.invoke([
    new SystemMessage(
      `You are a travel expert. Return ONLY a valid JSON array of exactly 3 Activity objects. No markdown, no explanation.

Activity schema:
{
  "id": "string",
  "time": "HH:MM",
  "name": "string",
  "description": "2-3 sentence description",
  "location": "specific location",
  "category": "food|activity|transport|accommodation|sightseeing",
  "estimatedCost": number,
  "currency": "USD",
  "duration": "X hours",
  "tips": "local tip",
  "imageQuery": "search query"
}`
    ),
    new HumanMessage(
      `For a ${itinerary.vibe} trip to ${itinerary.destination}, suggest 3 alternative activities to replace "${activity.name}" at ${activity.time} on Day ${dayIndex + 1} (theme: "${day.theme}"). Budget for this slot: ~$${activity.estimatedCost}. Return a JSON array of 3 Activity objects with unique ids like "alt-1", "alt-2", "alt-3".`
    ),
  ]);

  try {
    const content = response.content as string;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as Activity[];
  } catch {
    return [];
  }
}

// Compute a plain-English diff between two itineraries (max 8 changes)
export function computeItineraryDiff(
  before: GeneratedItinerary,
  after: GeneratedItinerary
): string[] {
  const changes: string[] = [];

  if (before.totalBudget !== after.totalBudget) {
    changes.push(`Budget updated from $${before.totalBudget.toLocaleString()} to $${after.totalBudget.toLocaleString()}`);
  }

  if (before.summary !== after.summary) {
    changes.push("Trip summary refreshed");
  }

  // Check each day for activity changes
  for (const afterDay of after.days) {
    const beforeDay = before.days.find((d) => d.day === afterDay.day);
    if (!beforeDay) {
      changes.push(`Day ${afterDay.day} added: "${afterDay.theme}"`);
      continue;
    }

    if (beforeDay.theme !== afterDay.theme) {
      changes.push(`Day ${afterDay.day} theme changed to "${afterDay.theme}"`);
    }

    const beforeIds = new Set(beforeDay.activities.map((a) => a.id));
    const afterIds = new Set(afterDay.activities.map((a) => a.id));

    for (const a of afterDay.activities) {
      if (!beforeIds.has(a.id)) {
        changes.push(`Day ${afterDay.day}: "${a.name}" added`);
      } else {
        const prev = beforeDay.activities.find((x) => x.id === a.id);
        if (prev && prev.name !== a.name) {
          changes.push(`Day ${afterDay.day}: "${prev.name}" renamed to "${a.name}"`);
        }
      }
      if (changes.length >= 8) break;
    }

    for (const a of beforeDay.activities) {
      if (!afterIds.has(a.id)) {
        changes.push(`Day ${afterDay.day}: "${a.name}" removed`);
      }
      if (changes.length >= 8) break;
    }

    if (changes.length >= 8) break;
  }

  // Check packing tips diff
  if (changes.length < 8 && before.packingTips.length !== after.packingTips.length) {
    changes.push(`Packing list updated (${after.packingTips.length} tips)`);
  }

  return changes.slice(0, 8);
}
