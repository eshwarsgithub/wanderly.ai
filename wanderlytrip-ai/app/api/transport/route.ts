import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIObject } from "@/lib/parse-ai-json";

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let body: { destination: string; days: Array<{ day: number; activities: Array<{ name: string; location: string }> }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { destination, days } = body;
  if (!destination || !days?.length) {
    return NextResponse.json({ error: "destination and days are required" }, { status: 400 });
  }

  // Summarize activities to keep prompt small
  const daysSummary = days
    .slice(0, 7)
    .map((d) => `Day ${d.day}: ${d.activities.map((a) => a.name + " at " + a.location).join(" → ")}`)
    .join("\n");

  try {
    const llm = getModelForTask("helper", { temperature: 0, maxTokens: 1200 });
    const res = await llm.invoke([
      new SystemMessage("You are a transport expert. Return ONLY valid JSON, no markdown."),
      new HumanMessage(`Generate a transport guide for a traveler in ${destination}.

Activities per day:
${daysSummary}

Return JSON with this exact shape:
{
  "destination": "${destination}",
  "overview": "<2 sentence overview of the transport system>",
  "travelCard": {
    "name": "<card/pass name or null>",
    "tip": "<how to get it and use it>",
    "avgDailyCost": "<cost range in local + USD>"
  },
  "recommendedApp": "<best navigation app for this city>",
  "days": [
    {
      "day": 1,
      "transitions": [
        {
          "from": "<activity or hotel name>",
          "to": "<next activity name>",
          "mode": "metro|bus|taxi|walk|tuk-tuk|ferry|cable-car|rideshare",
          "icon": "<single emoji>",
          "details": "<line/route name or directions>",
          "estimatedTime": "<duration>",
          "estimatedCost": "<local currency and USD>",
          "tip": "<optional short tip>"
        }
      ]
    }
  ],
  "warnings": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`),
    ]);
    const data = parseAIObject(res.content);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to generate transport guide" }, { status: 500 });
  }
}
