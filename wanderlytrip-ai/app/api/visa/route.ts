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
  const passport = req.nextUrl.searchParams.get("passport") ?? "US";

  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "API key not set" }, { status: 500 });
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  try {
    const llm = getModelForTask("helper", { temperature: 0, maxTokens: 600 });
    const res = await llm.invoke([
      new SystemMessage("You are a visa expert. Return ONLY valid JSON, no markdown."),
      new HumanMessage(`Visa and entry requirements for a ${passport} passport holder visiting ${destination}.
Return JSON:
{
  "destination": "<country>",
  "passport": "${passport}",
  "visaType": "visa-free|visa-on-arrival|e-visa|visa-required",
  "stayLimit": "<e.g. 90 days or 30 days>",
  "cost": "<e.g. Free or $35 USD>",
  "processingTime": "<e.g. Instant on arrival or 3-5 business days>",
  "requirements": ["<document 1>", "<document 2>", "<document 3>"],
  "healthRequirements": ["<vaccination or health cert if any, or empty array>"],
  "entryNotes": "<1-2 sentence important entry tip>",
  "applyAt": "<URL or null if visa-free/on-arrival>",
  "warningLevel": "safe|caution|high",
  "travelAdvisory": "<one sentence current travel advisory>"
}`),
    ]);
    const data = parseAIObject(res.content);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch visa info" }, { status: 500 });
  }
}
