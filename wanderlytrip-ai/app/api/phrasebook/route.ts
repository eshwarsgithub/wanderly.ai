import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination");
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  try {
    const llm = new ChatOpenAI({ apiKey, model: "gpt-4o-mini", temperature: 0 });
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

    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to generate phrasebook" }, { status: 500 });
  }
}
