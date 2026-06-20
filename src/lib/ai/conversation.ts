import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import {
  ConversationStartersSchema,
  MatchExplanationSchema,
  type ConversationStartersOutput,
  type MatchExplanationOutput,
} from "@/lib/ai/schemas";
import { CONVERSATION_SYSTEM, MATCH_EXPLANATION_SYSTEM } from "@/lib/ai/prompts";
import type { Profile } from "@/types";

function profileBrief(p: Profile): string {
  return `${p.full_name}, ${p.age}, ${p.district}, intent:${p.intent}, interests:${p.interest_tags?.join(",")}`;
}

export async function generateConversationStarters(
  profileA: Profile,
  profileB: Profile
): Promise<{ data: ConversationStartersOutput; model: string }> {
  const fallback: ConversationStartersOutput = {
    ice_breakers: [`Hi ${profileB.full_name.split(" ")[0]}! I'd love to know more about you.`],
    shared_interest_questions: ["What drew you to Saathini?"],
    compatibility_questions: ["What does an ideal weekend look like for you?"],
  };

  if (!getAIProvider().isAvailable()) return { data: fallback, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: CONVERSATION_SYSTEM },
        {
          role: "user",
          content: `User A: ${profileBrief(profileA)}\nUser B: ${profileBrief(profileB)}\nReturn JSON: { ice_breakers, shared_interest_questions, compatibility_questions }`,
        },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 500 }
    );
    return { data: ConversationStartersSchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: fallback, model: "local-fallback" };
  }
}

export async function explainMatch(
  profileA: Profile,
  profileB: Profile,
  compatibilityScore: number
): Promise<{ data: MatchExplanationOutput; model: string }> {
  const fallback: MatchExplanationOutput = {
    match_summary: `You and ${profileB.full_name.split(" ")[0]} share a ${compatibilityScore}% compatibility score.`,
    compatibility_highlights: ["Aligned intent", "Regional connection"],
    discussion_areas: ["Future plans", "Family expectations"],
  };

  if (!getAIProvider().isAvailable()) return { data: fallback, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: MATCH_EXPLANATION_SYSTEM },
        {
          role: "user",
          content: `Score: ${compatibilityScore}\nA: ${profileBrief(profileA)}\nB: ${profileBrief(profileB)}\nReturn JSON: { match_summary, compatibility_highlights, discussion_areas, trust_note? }`,
        },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 500 }
    );
    return { data: MatchExplanationSchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: fallback, model: "local-fallback" };
  }
}
