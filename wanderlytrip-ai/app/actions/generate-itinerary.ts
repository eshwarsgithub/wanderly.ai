"use server";

import { generateItinerary, type TripInput, type GeneratedItinerary } from "@/lib/ai-agent";
import { refineItinerary } from "@/lib/ai-agent";

export interface GenerateResult {
  success: true;
  itinerary: GeneratedItinerary;
}

export interface GenerateError {
  success: false;
  error: string;
}

export async function generateTripAction(
  input: TripInput
): Promise<GenerateResult | GenerateError> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured. Add it to .env.local.");
    }

    const itinerary = await generateItinerary(input);
    return { success: true, itinerary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error generating itinerary";
    return { success: false, error: message };
  }
}

export async function refineTripAction(
  itinerary: GeneratedItinerary,
  userRequest: string
): Promise<GenerateResult | GenerateError> {
  try {
    const refined = await refineItinerary(itinerary, userRequest);
    return { success: true, itinerary: refined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error refining itinerary";
    return { success: false, error: message };
  }
}
