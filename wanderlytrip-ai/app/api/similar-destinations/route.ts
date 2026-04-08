import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination") ?? "";
  const vibe = req.nextUrl.searchParams.get("vibe") ?? "";
  const budget = req.nextUrl.searchParams.get("budget") ?? "";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ suggestions: [] });

  try {
    const llm = new ChatOpenAI({ apiKey, model: "gpt-4o-mini", temperature: 0.85, maxTokens: 400 });
    const res = await llm.invoke([
      new SystemMessage("You are a travel recommendation expert. Return ONLY valid JSON, no markdown."),
      new HumanMessage(
        `A traveler just planned a ${vibe || "adventure"} trip to ${destination} with a $${budget || "2000"} budget. Suggest 3 other destinations they would absolutely love. Return a JSON array: [{ "destination": "City, Country", "country": "Country", "flag": "emoji flag", "pitch": "2-sentence pitch", "bestFor": "one-word vibe", "budgetRange": "$X-$Y" }]. Raw JSON array only.`
      ),
    ]);
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const suggestions = JSON.parse(raw.replace(/```json\n?|```/g, "").trim());
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
