import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { ReadinessOutputSchema, type ReadinessOutput } from "@/lib/ai/schemas";
import { READINESS_SYSTEM, READINESS_USER } from "@/lib/ai/prompts";
import { calculateReadinessScore } from "@/lib/matching/compatibility";

function localFallback(answers: Record<string, string>): ReadinessOutput {
  const base = calculateReadinessScore(answers);
  return {
    overall: base,
    communication: Math.min(100, base + 5),
    commitment: base,
    family_alignment: Math.max(40, base - 5),
    emotional_readiness: base,
    marriage_readiness: Math.max(30, base - 10),
    long_term_potential: base,
    summary: base >= 70
      ? "You're showing strong readiness for a meaningful relationship."
      : "You're building clarity — keep reflecting on what matters to you.",
  };
}

export async function analyzeReadiness(
  answers: Record<string, string>,
  intent: string
): Promise<{ data: ReadinessOutput; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return { data: localFallback(answers), model: "local" };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: READINESS_SYSTEM },
        { role: "user", content: READINESS_USER(answers, intent) },
      ],
      { tier: "primary", jsonMode: true, maxTokens: 600 }
    );
    const parsed = ReadinessOutputSchema.parse(parseAIJson(result.content));
    return { data: parsed, model: result.model };
  } catch {
    return { data: localFallback(answers), model: "local-fallback" };
  }
}
