import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { CompatibilityOutputSchema, type CompatibilityOutput } from "@/lib/ai/schemas";
import { COMPATIBILITY_SYSTEM, COMPATIBILITY_USER } from "@/lib/ai/prompts";
import { calculateCompatibility } from "@/lib/matching/compatibility";
import type { Profile } from "@/types";

function profileToText(p: Profile): string {
  return JSON.stringify({
    name: p.full_name,
    intent: p.intent,
    age: p.age,
    district: p.district,
    region: p.region,
    education: p.education,
    profession: p.profession,
    bio: p.bio,
    tags: { personality: p.personality_tags, interests: p.interest_tags, values: p.values_tags },
    lifestyle: p.lifestyle,
    family: p.family_background,
    trust_score: p.trust_score,
  });
}

function localFallback(a: Profile, b: Profile): CompatibilityOutput {
  const r = calculateCompatibility(a, b);
  return {
    score: r.score,
    strengths: r.strong_matches,
    concerns: r.mismatch_warnings,
    summary: r.explanation,
  };
}

export async function analyzeCompatibility(
  profileA: Profile,
  profileB: Profile
): Promise<{ data: CompatibilityOutput; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return { data: localFallback(profileA, profileB), model: "local" };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: COMPATIBILITY_SYSTEM },
        { role: "user", content: COMPATIBILITY_USER(profileToText(profileA), profileToText(profileB)) },
      ],
      { tier: "primary", jsonMode: true, maxTokens: 800 }
    );
    const parsed = CompatibilityOutputSchema.parse(parseAIJson(result.content));
    return { data: parsed, model: result.model };
  } catch {
    return { data: localFallback(profileA, profileB), model: "local-fallback" };
  }
}
