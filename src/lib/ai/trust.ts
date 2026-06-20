import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { TrustScoreOutputSchema, type TrustScoreOutput } from "@/lib/ai/schemas";
import { TRUST_SYSTEM } from "@/lib/ai/prompts";
import { calculateTrustScore } from "@/lib/matching/compatibility";

export interface TrustFactors {
  mobile_verified: boolean;
  face_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
  profile_completeness: number;
  report_count: number;
  account_age_days: number;
}

function localTrust(factors: TrustFactors): TrustScoreOutput {
  const score = calculateTrustScore(factors);
  const level =
    score >= 80 ? "highly_trusted" : score >= 60 ? "trusted" : score >= 40 ? "building" : "new";
  return {
    score,
    level,
    factors: {
      verification: factors.mobile_verified && factors.face_verified ? 80 : 40,
      completeness: factors.profile_completeness,
      reports: Math.max(0, 100 - factors.report_count * 20),
    },
    summary: `Trust score based on verification and profile quality.`,
  };
}

export async function analyzeTrust(
  factors: TrustFactors
): Promise<{ data: TrustScoreOutput; model: string }> {
  const base = localTrust(factors);
  if (!getAIProvider().isAvailable()) return { data: base, model: "local" };

  try {
    const result = await aiComplete(
      [
        { role: "system", content: TRUST_SYSTEM },
        { role: "user", content: `Factors: ${JSON.stringify(factors)}\nComputed score: ${base.score}\nReturn JSON: { score, level, factors, summary }` },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 300 }
    );
    return { data: TrustScoreOutputSchema.parse(parseAIJson(result.content)), model: result.model };
  } catch {
    return { data: base, model: "local-fallback" };
  }
}
