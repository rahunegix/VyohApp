import type { Profile, CompatibilityResult } from "@/types";

interface CompatibilityFactors {
  intentMatch: number;
  lifeGoals: number;
  familyExpectations: number;
  careerAmbition: number;
  relocation: number;
  lifestyle: number;
  religion: number;
  education: number;
  communication: number;
  children: number;
  region: number;
  trust: number;
}

const WEIGHTS: Record<keyof CompatibilityFactors, number> = {
  intentMatch: 15,
  lifeGoals: 12,
  familyExpectations: 10,
  careerAmbition: 8,
  relocation: 8,
  lifestyle: 10,
  religion: 7,
  education: 5,
  communication: 10,
  children: 8,
  region: 7,
  trust: 10,
};

function scoreMatch(a: string | null | undefined, b: string | null | undefined): number {
  if (!a || !b) return 50;
  if (a === b) return 100;
  if (a === "open" || b === "open") return 75;
  return 30;
}

function scoreIntent(a: Profile["intent"], b: Profile["intent"]): number {
  if (a === b) return 100;
  const compatible: Record<string, string[]> = {
    exploring: ["exploring", "serious"],
    serious: ["exploring", "serious", "marriage"],
    marriage: ["serious", "marriage"],
  };
  return compatible[a]?.includes(b) ? 70 : 30;
}

function scoreRegion(a: Profile, b: Profile): number {
  if (a.region === b.region) return 100;
  if (a.region === "both" || b.region === "both") return 85;
  if (a.district === b.district) return 90;
  if (a.region && b.region) return 50;
  return 60;
}

export function calculateCompatibility(
  profileA: Profile,
  profileB: Profile
): CompatibilityResult {
  const lifestyleA = profileA.lifestyle ?? {};
  const lifestyleB = profileB.lifestyle ?? {};

  const factors: CompatibilityFactors = {
    intentMatch: scoreIntent(profileA.intent, profileB.intent),
    lifeGoals: scoreMatch(lifestyleA.future_plans, lifestyleB.future_plans),
    familyExpectations: scoreMatch(
      profileA.family_background?.family_involvement,
      profileB.family_background?.family_involvement
    ),
    careerAmbition: scoreMatch(lifestyleA.career_focus, lifestyleB.career_focus),
    relocation: scoreMatch(lifestyleA.relocation, lifestyleB.relocation),
    lifestyle: scoreMatch(lifestyleA.food_preference, lifestyleB.food_preference) * 0.5 +
      scoreMatch(lifestyleA.smoking, lifestyleB.smoking) * 0.25 +
      scoreMatch(lifestyleA.drinking, lifestyleB.drinking) * 0.25,
    religion: scoreMatch(
      profileA.family_background?.religious_preference,
      profileB.family_background?.religious_preference
    ),
    education: scoreMatch(profileA.education, profileB.education) * 0.6 + 40,
    communication: 75,
    children: scoreMatch(lifestyleA.kids_preference, lifestyleB.kids_preference),
    region: scoreRegion(profileA, profileB),
    trust: Math.min(profileA.trust_score, profileB.trust_score),
  };

  let totalWeight = 0;
  let weightedSum = 0;
  const strong_matches: string[] = [];
  const mismatch_warnings: string[] = [];

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = factors[key as keyof CompatibilityFactors];
    weightedSum += score * weight;
    totalWeight += weight;
    if (score >= 80) {
      strong_matches.push(getMatchReason(key, score));
    } else if (score < 40) {
      mismatch_warnings.push(getMismatchWarning(key));
    }
  }

  const score = Math.round(weightedSum / totalWeight);

  return {
    score,
    explanation: generateExplanation(score, profileA, profileB),
    strong_matches: strong_matches.slice(0, 4),
    mismatch_warnings: mismatch_warnings.slice(0, 3),
  };
}

function getMatchReason(key: string, score: number): string {
  const reasons: Record<string, string> = {
    intentMatch: "Aligned relationship intentions",
    lifeGoals: "Similar life goals and future plans",
    familyExpectations: "Compatible family expectations",
    careerAmbition: "Aligned career ambitions",
    relocation: "Similar relocation preferences",
    lifestyle: "Compatible lifestyle choices",
    religion: "Shared religious values",
    education: "Similar educational background",
    communication: "Good communication compatibility",
    children: "Aligned views on children",
    region: "Strong regional connection",
    trust: "High mutual trust scores",
  };
  return reasons[key] ?? `Strong ${key} match (${score}%)`;
}

function getMismatchWarning(key: string): string {
  const warnings: Record<string, string> = {
    intentMatch: "Different relationship intentions — discuss openly",
    lifeGoals: "Different life goals — worth exploring",
    familyExpectations: "Different family involvement expectations",
    relocation: "Different relocation preferences",
    lifestyle: "Some lifestyle differences",
    children: "Different views on children",
    region: "Different regional backgrounds",
  };
  return warnings[key] ?? `Potential difference in ${key}`;
}

function generateExplanation(score: number, a: Profile, b: Profile): string {
  if (score >= 85) {
    return `You and ${b.full_name.split(" ")[0]} share strong alignment across values, intent, and lifestyle. This is a promising connection worth exploring.`;
  }
  if (score >= 70) {
    return `There's meaningful compatibility with ${b.full_name.split(" ")[0]}, especially in shared values. Some areas may need conversation — that's healthy.`;
  }
  if (score >= 50) {
    return `You have some common ground with ${b.full_name.split(" ")[0]}, but also meaningful differences. Open conversation will help you both decide.`;
  }
  return `You and ${b.full_name.split(" ")[0]} have different priorities in several areas. That doesn't mean no connection — just be intentional.`;
}

export function calculateTrustScore(factors: {
  mobile_verified: boolean;
  face_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
  profile_completeness: number;
  report_count: number;
  account_age_days: number;
}): number {
  let score = 20;
  if (factors.mobile_verified) score += 20;
  if (factors.face_verified) score += 25;
  if (factors.id_verified) score += 20;
  if (factors.family_verified) score += 10;
  score += Math.min(factors.profile_completeness * 0.15, 15);
  score -= Math.min(factors.report_count * 10, 30);
  if (factors.account_age_days > 30) score += 5;
  if (factors.account_age_days > 90) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateReadinessScore(answers: Record<string, string>): number {
  const positiveKeywords = [
    "ready", "committed", "serious", "family", "future", "trust",
    "communication", "values", "partnership", "growth",
  ];
  const text = Object.values(answers).join(" ").toLowerCase();
  const matches = positiveKeywords.filter((k) => text.includes(k)).length;
  return Math.min(100, 40 + matches * 8);
}
