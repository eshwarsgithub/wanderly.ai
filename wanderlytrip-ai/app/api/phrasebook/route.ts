import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIObject } from "@/lib/parse-ai-json";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }

  const destination = req.nextUrl.searchParams.get("destination");
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  try {
    const llm = getModelForTask("helper", { temperature: 0 });
    const res = await llm.invoke([
      new SystemMessage("You are a travel language assistant. Return ONLY valid JSON, no markdown fences."),
      new HumanMessage(`Generate a travel phrasebook for someone visiting ${destination}.
Return JSON with this exact shape:
{
  "language": "<primary language name>",
  "categories": [
    {
      "name": "Greetings",
      "phrases": [
        { "english": "Hello", "local": "<translated>", "phonetic": "<pronunciation>" },
        { "english": "Thank you", "local": "<translated>", "phonetic": "<pronunciation>" },
        { "english": "Please", "local": "<translated>", "phonetic": "<pronunciation>" },
        { "english": "Excuse me", "local": "<translated>", "phonetic": "<pronunciation>" },
        { "english": "Goodbye", "local": "<translated>", "phonetic": "<pronunciation>" }
      ]
    },
    {
      "name": "Food & Dining",
      "phrases": [5 food/restaurant phrases]
    },
    {
      "name": "Transport",
      "phrases": [5 transport/directions phrases]
    },
    {
      "name": "Shopping",
      "phrases": [5 shopping/bargaining phrases]
    },
    {
      "name": "Emergency",
      "phrases": [5 emergency/help phrases]
    }
  ]
}`),
    ]);

    const data = parseAIObject(res.content);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to generate phrasebook" }, { status: 500 });
  }
}
