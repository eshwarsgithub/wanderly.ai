"use server";

import {
  generateItinerary,
  refineItinerary,
  parseNaturalLanguage,
  getActivityAlternatives,
  type TripInput,
  type GeneratedItinerary,
  type Activity,
} from "@/lib/ai-agent";

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
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }
    const refined = await refineItinerary(itinerary, userRequest);
    return { success: true, itinerary: refined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error refining itinerary";
    return { success: false, error: message };
  }
}

export interface ParseNLResult {
  success: true;
  partial: Partial<TripInput>;
}

export async function parseNLAction(
  text: string
): Promise<ParseNLResult | GenerateError> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }
    const partial = await parseNaturalLanguage(text);
    return { success: true, partial };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error parsing input";
    return { success: false, error: message };
  }
}

export interface SwapResult {
  success: true;
  alternatives: Activity[];
}

export async function swapActivityAction(
  itinerary: GeneratedItinerary,
  dayIndex: number,
  activityId: string
): Promise<SwapResult | GenerateError> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }
    const alternatives = await getActivityAlternatives(itinerary, dayIndex, activityId);
    return { success: true, alternatives };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error getting alternatives";
    return { success: false, error: message };
  }
}
