import type { MessageContent } from "@langchain/core/messages";

/**
 * Normalize LangChain MessageContent to a plain string.
 * Gemini/OpenRouter can return an array of content blocks instead of a string.
 */
export function normalizeContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (typeof block === "object" && block !== null && "text" in block) {
          return (block as unknown as { text: string }).text;
        }
        return "";
      })
      .join("");
  }
  return String(content);
}

/** Strip thinking blocks, markdown fences, then extract the outermost {...} */
function cleanAndExtract(raw: string, bracket: "{" | "["): string {
  // Strip <thinking>...</thinking> blocks (Gemini 2.5 Pro chain-of-thought)
  let text = raw.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json|js|javascript)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const closeBracket = bracket === "{" ? "}" : "]";
  const start = text.indexOf(bracket);
  const end = text.lastIndexOf(closeBracket);
  if (start !== -1 && end > start) return text.slice(start, end + 1);

  throw new Error("No JSON found in AI response");
}

function tryParse(jsonStr: string): unknown {
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Fix trailing commas (common Gemini quirk)
    const cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}

/** Parse AI response as a JSON object */
export function parseAIObject<T = unknown>(content: MessageContent): T {
  const str = normalizeContent(content);
  const jsonStr = cleanAndExtract(str, "{");
  return tryParse(jsonStr) as T;
}

/** Parse AI response as a JSON array */
export function parseAIArray<T = unknown>(content: MessageContent): T[] {
  const str = normalizeContent(content);
  // Try array first, fall back to object with array extraction
  try {
    const jsonStr = cleanAndExtract(str, "[");
    return tryParse(jsonStr) as T[];
  } catch {
    // Some models return {"data": [...]} — try extracting nested array
    const jsonStr = cleanAndExtract(str, "{");
    const obj = tryParse(jsonStr) as Record<string, unknown>;
    const arr = Object.values(obj).find(Array.isArray);
    if (arr) return arr as T[];
    throw new Error("No JSON array found in AI response");
  }
}
