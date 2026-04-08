import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination") ?? "";
  const passport = req.nextUrl.searchParams.get("passport") ?? "US";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });
  if (!destination) return NextResponse.json({ error: "destination required" }, { status: 400 });

  try {
    const llm = new ChatOpenAI({ apiKey, model: "gpt-4o-mini", temperature: 0, maxTokens: 600 });
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
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const data = JSON.parse(raw.replace(/```json\n?|```/g, "").trim());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch visa info" }, { status: 500 });
  }
}
