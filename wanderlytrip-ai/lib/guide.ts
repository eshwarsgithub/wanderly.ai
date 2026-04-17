import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModelForTask } from "./model-router";

export interface DestinationGuide {
  destination: string;
  country: string;
  overview: string;
  bestTime: string;
  mustSee: string[];
  hiddenGems: string[];
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
      new HumanMessage(`Generate a comprehensive travel guide for ${destination}.
Return JSON with this exact shape:
{
  "destination": "${destination}",
  "country": "<country name>",
  "overview": "<3-4 sentence vivid overview capturing the essence and atmosphere>",
  "bestTime": "<best time to visit, weather, festivals, crowd levels — 2 sentences>",
  "mustSee": ["<name: description — why unmissable>", "<name: description>", "<name: description>", "<name: description>", "<name: description>"],
  "hiddenGems": ["<name: description — off the beaten path, locals-only spot>", "<name: description>", "<name: description>", "<name: description>"],
  "cuisine": ["<dish or food experience: description and where to try it>", "<dish: description>", "<dish: description>", "<dish: description>", "<dish: description>"],
  "gettingAround": "<practical transport tips: metro, taxi, walking, apps — 2-3 sentences>",
  "safety": "<honest safety assessment, areas to avoid, common scams, emergency tips — 2 sentences>",
  "culturalTips": ["<specific do or don't with brief explanation>", "<tip>", "<tip>", "<tip>", "<tip>"],
  "budgetEstimate": "<daily budget in USD: budget $X-Y | mid-range $Y-Z | luxury $Z+"
}`),
    ]);
    const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned) as DestinationGuide;
  } catch {
    return null;
  }
}
