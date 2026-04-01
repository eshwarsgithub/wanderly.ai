import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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

export interface TripInput {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  vibe: string;
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
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-6",
    maxTokens: 8000,
    temperature: 0.8,
  });

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const userPrompt = `Plan a ${days}-day ${input.vibe} trip to ${input.destination}.
- Dates: ${input.startDate} to ${input.endDate}
- Budget: $${input.budget} USD total for ${input.travelers} traveler(s)
- Vibe: ${input.vibe}
- Travelers: ${input.travelers}

Generate the complete itinerary JSON now.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;

  // Parse the JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI returned invalid response format");
  }

  const itinerary = JSON.parse(jsonMatch[0]) as GeneratedItinerary;

  // Ensure an ID exists
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
