import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIArray } from "@/lib/parse-ai-json";
import type { WeatherDay } from "@/lib/weather";

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ advisory: [], packingAdditions: [] });

  let body: { weatherDays: WeatherDay[]; destination: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ advisory: [], packingAdditions: [] });
  }

  const { weatherDays, destination } = body;
  if (!weatherDays?.length || !destination) {
    return NextResponse.json({ advisory: [], packingAdditions: [] });
  }

  // Deterministic packing additions (no Claude needed)
  const packingAdditions: string[] = [];
  const maxRain = Math.max(...weatherDays.map((w) => w.precipitationChance));
  const maxTemp = Math.max(...weatherDays.map((w) => w.tempHighC));
  const minTemp = Math.min(...weatherDays.map((w) => w.tempLowC));
  if (maxRain > 40) packingAdditions.push("Compact umbrella or rain poncho");
  if (maxTemp > 30) packingAdditions.push("SPF 50+ sunscreen and UV sunglasses");
  if (minTemp < 10) packingAdditions.push("Warm layer or light jacket for evenings");
  if (maxTemp > 28) packingAdditions.push("Breathable, moisture-wicking clothing");

  try {
    const llm = getModelForTask("helper", { temperature: 0.3, maxTokens: 350 });
    const summary = weatherDays
      .map((w) => `${w.date}: ${w.tempLowC}°-${w.tempHighC}°C, ${w.description}, ${w.precipitationChance}% rain`)
      .join(" | ");

    const res = await llm.invoke([
      new SystemMessage("You are a travel weather advisor. Return ONLY a valid JSON array of strings."),
      new HumanMessage(
        `Weather forecast for ${destination}: ${summary}\n\nGive exactly 3 practical, specific travel tips based on this forecast. Tips should be actionable (timing, clothing, activity adjustments). Return a JSON array of 3 strings only.`
      ),
    ]);
    const advisory = parseAIArray<string>(res.content);
    return NextResponse.json({ advisory, packingAdditions });
  } catch {
    return NextResponse.json({ advisory: [], packingAdditions });
  }
}
