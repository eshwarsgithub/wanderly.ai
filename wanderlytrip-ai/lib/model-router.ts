import { ChatOpenAI } from "@langchain/openai";

export type TaskType = "main-itinerary" | "refinement" | "helper";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

// Cost-optimised model allocation:
//   main-itinerary → Gemini 2.5 Pro     (~$0.04–0.10/call) — best structured JSON, large context
//   refinement     → Gemini 2.0 Flash   (~$0.01–0.02/call) — fast + cheap for incremental edits
//   helper         → DeepSeek Chat      (<$0.008/call)     — cheapest capable model for short JSON
//
// NOTE: Anthropic models require separate billing approval on OpenRouter.
// Gemini 2.5 Pro delivers comparable itinerary quality with no extra setup.
const MODEL_MAP: Record<TaskType, string> = {
  "main-itinerary": "google/gemini-2.5-pro-preview",
  "refinement":     "google/gemini-2.0-flash",
  "helper":         "deepseek/deepseek-chat",
};

export function getModelForTask(
  taskType: TaskType,
  opts: { maxTokens?: number; temperature?: number } = {}
): ChatOpenAI {
  return new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: MODEL_MAP[taskType],
    maxTokens: opts.maxTokens ?? 8000,
    temperature: opts.temperature ?? 0.7,
    configuration: {
      baseURL: OPENROUTER_BASE,
      defaultHeaders: {
        "HTTP-Referer": "https://wanderlytrip.ai",
        "X-Title": "WanderlyTrip.ai",
      },
    },
  });
}
