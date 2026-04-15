import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIObject } from "@/lib/parse-ai-json";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }

  const destination = req.nextUrl.searchParams.get("destination") ?? "";
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  try {
    const llm = getModelForTask("helper", { temperature: 0, maxTokens: 500 });
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
    const data = parseAIObject(res.content);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch emergency info" }, { status: 500 });
  }
}
