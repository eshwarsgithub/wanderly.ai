import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

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
const ActivitySchema = z.object({
  id: z.string(),
  time: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  category: z.enum(["food", "activity", "transport", "accommodation", "sightseeing"]),
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

function parseItineraryJSON(content: string): GeneratedItinerary {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid response format");

  let raw: unknown;
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("AI returned malformed JSON");
  }

  const result = GeneratedItinerarySchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join(", ");
    throw new Error(`AI response failed validation: ${issues}`);
  }

  return result.data as GeneratedItinerary;
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
- totalBudget should be the sum of all daily costs`;

export async function generateItinerary(input: TripInput): Promise<GeneratedItinerary> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    maxTokens: 8000,
    temperature: 0.8,
  });

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

  const userPrompt = `Plan a ${input.vibe} trip: ${destinationDesc}.
- Dates: ${input.startDate} to ${input.endDate}
- Total days: ${days}
- Budget: $${input.budget} USD total for ${input.travelers} traveler(s)
- Vibe: ${input.vibe}
- Travelers: ${input.travelers}${cityFieldNote}

Generate the complete itinerary JSON now.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
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
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    maxTokens: 8000,
    temperature: 0.7,
  });

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Here is the current itinerary JSON:\n${JSON.stringify(itinerary, null, 2)}\n\nUser request: "${userRequest}"\n\nConstraint: The total cost of all activities must not exceed the original budget of $${itinerary.totalBudget} USD. Adjust activity costs accordingly.\n\nApply the changes and return the updated complete itinerary JSON.`
    ),
  ]);

  const content = response.content as string;
  return parseItineraryJSON(content);
}

// Parse natural language into partial TripInput fields
export async function parseNaturalLanguage(text: string): Promise<Partial<TripInput>> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    maxTokens: 512,
    temperature: 0,
  });

  const response = await model.invoke([
    new SystemMessage(
      `Extract trip planning details from the user's text. Return ONLY a JSON object with any of these optional fields: destination, startDate (ISO), endDate (ISO), budget (number), travelers (number), vibe. Omit fields not mentioned.`
    ),
    new HumanMessage(text),
  ]);

  const content = response.content as string;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    return JSON.parse(jsonMatch[0]) as Partial<TripInput>;
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
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    maxTokens: 2000,
    temperature: 0.9,
  });

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

  const content = response.content as string;
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    return JSON.parse(jsonMatch[0]) as Activity[];
  } catch {
    return [];
  }
}
