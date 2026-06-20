import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { ModerationOutputSchema, type ModerationOutput } from "@/lib/ai/schemas";
import { MODERATION_SYSTEM } from "@/lib/ai/prompts";

export async function moderateContent(
  content: string,
  context: "message" | "profile" | "report"
): Promise<{ data: ModerationOutput; model: string }> {
  const safe: ModerationOutput = {
    risk_level: "none",
    categories: [],
    explanation: "No issues detected.",
    recommend_review: false,
  };

  if (!getAIProvider().isAvailable()) return { data: safe, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: MODERATION_SYSTEM },
        { role: "user", content: `Context: ${context}\nContent:\n${content}\nReturn JSON: { risk_level, categories, explanation, recommend_review }` },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 300 }
    );
    return { data: ModerationOutputSchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: safe, model: "local-fallback" };
  }
}
