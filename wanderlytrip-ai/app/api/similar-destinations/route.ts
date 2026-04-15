import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "@/lib/model-router";
import { parseAIArray } from "@/lib/parse-ai-json";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const destination = req.nextUrl.searchParams.get("destination") ?? "";
  const vibe = req.nextUrl.searchParams.get("vibe") ?? "";
  const budget = req.nextUrl.searchParams.get("budget") ?? "";

  try {
    const llm = getModelForTask("helper", { temperature: 0.85, maxTokens: 400 });
    const res = await llm.invoke([
      new SystemMessage("You are a travel recommendation expert. Return ONLY valid JSON, no markdown."),
      new HumanMessage(
        `A traveler just planned a ${vibe || "adventure"} trip to ${destination} with a $${budget || "2000"} budget. Suggest 3 other destinations they would absolutely love. Return a JSON array: [{ "destination": "City, Country", "country": "Country", "flag": "emoji flag", "pitch": "2-sentence pitch", "bestFor": "one-word vibe", "budgetRange": "$X-$Y" }]. Raw JSON array only.`
      ),
    ]);
    const suggestions = parseAIArray(res.content);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
