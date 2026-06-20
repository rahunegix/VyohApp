import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { SearchQuerySchema, AssistantReplySchema, type SearchQueryOutput, type AssistantReplyOutput } from "@/lib/ai/schemas";
import { SEARCH_SYSTEM, ASSISTANT_SYSTEM } from "@/lib/ai/prompts";

export async function parseNaturalLanguageSearch(
  query: string
): Promise<{ data: SearchQueryOutput; model: string }> {
  const fallback: SearchQueryOutput = {
    filters: { keywords: query.split(" ").filter(Boolean) },
    interpreted_query: query,
  };

  if (!getAIProvider().isAvailable()) return { data: fallback, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: SEARCH_SYSTEM },
        { role: "user", content: `Query: "${query}"\nReturn JSON: { filters: { intent?, gender?, district?, region?, profession?, education?, keywords? }, interpreted_query }` },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 300 }
    );
    return { data: SearchQuerySchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: fallback, model: "local-fallback" };
  }
}

export async function askSaathiniAssistant(
  message: string,
  context?: string
): Promise<{ data: AssistantReplyOutput; model: string }> {
  const fallback: AssistantReplyOutput = {
    reply: "I'm Saathini AI, here to help with your profile, matches, and safety. What would you like to know?",
    suggested_actions: ["Complete your profile", "Explore Discover", "Visit Trust Center"],
  };

  if (!getAIProvider().isAvailable()) return { data: fallback, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: ASSISTANT_SYSTEM },
        { role: "user", content: context ? `Context: ${context}\nUser: ${message}` : message },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 400 }
    );
    return { data: AssistantReplySchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: fallback, model: "local-fallback" };
  }
}
