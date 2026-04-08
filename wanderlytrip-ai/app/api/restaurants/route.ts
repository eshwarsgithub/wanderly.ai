import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

const RestaurantSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]),
  rating: z.number().int().min(1).max(5),
  neighborhood: z.string(),
  mustTry: z.string(),
  vibe: z.string(),
  tip: z.string(),
});

const RestaurantArraySchema = z.array(RestaurantSchema);

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination");

  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
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
    if (!jsonMatch) throw new Error("No JSON array found");

    const parsed = JSON.parse(jsonMatch[0]);
    const result = RestaurantArraySchema.safeParse(parsed);
    if (!result.success) throw new Error("Invalid restaurant data from AI");

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: "Failed to generate restaurant recommendations" }, { status: 500 });
  }
}
