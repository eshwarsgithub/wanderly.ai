import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination") ?? "";
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });

  try {
    const llm = new ChatOpenAI({ apiKey, model: "gpt-4o-mini", temperature: 0, maxTokens: 500 });
    const res = await llm.invoke([
      new SystemMessage("You are a travel safety expert. Return ONLY valid JSON, no markdown."),
      new HumanMessage(`Emergency contacts and safety information for a tourist in ${destination}.
Return JSON:
{
  "destination": "<city/country>",
  "police": "<number>",
  "ambulance": "<number>",
  "fire": "<number>",
  "touristPolice": "<number or null>",
  "emergencySMS": "<number or null>",
  "usEmbassy": "<phone or null>",
  "ukEmbassy": "<phone or null>",
  "hospitalTip": "<how to find nearest hospital, 1 sentence>",
  "localEmergencyApp": "<recommended safety app or null>",
  "scamWarnings": ["<common scam 1>", "<common scam 2>"],
  "safetyTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`),
    ]);
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const data = JSON.parse(raw.replace(/```json\n?|```/g, "").trim());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch emergency info" }, { status: 500 });
  }
}
