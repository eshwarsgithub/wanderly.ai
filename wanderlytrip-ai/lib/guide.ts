import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "./model-router";

export interface DestinationGuide {
  destination: string;
  country: string;
  overview: string;
  bestTime: string;
  mustSee: string[];
  cuisine: string[];
  gettingAround: string;
  safety: string;
  culturalTips: string[];
  budgetEstimate: string;
}

export async function getDestinationGuide(destination: string): Promise<DestinationGuide | null> {
  try {
    const llm = getModelForTask("helper", { temperature: 0 });
    const res = await llm.invoke([
      new SystemMessage("You are a travel expert. Return ONLY valid JSON, no markdown fences."),
      new HumanMessage(`Generate a concise travel guide for ${destination}.
Return JSON with this exact shape:
{
  "destination": "${destination}",
  "country": "<country name>",
  "overview": "<2-3 sentence overview of the destination>",
  "bestTime": "<best time to visit and why, 1-2 sentences>",
  "mustSee": ["<name: description>", "<name: description>", "<name: description>", "<name: description>", "<name: description>"],
  "cuisine": ["<dish: description>", "<dish: description>", "<dish: description>", "<dish: description>", "<dish: description>"],
  "gettingAround": "<how to get around the city/destination, 2 sentences>",
  "safety": "<safety tips, 1-2 sentences>",
  "culturalTips": ["<tip>", "<tip>", "<tip>", "<tip>"],
  "budgetEstimate": "<budget breakdown: budget/mid-range/luxury per day in USD>"
}`),
    ]);
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned) as DestinationGuide;
  } catch {
    return null;
  }
}
