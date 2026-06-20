import type { OnboardingState } from "@/types";
import { ONBOARDING_PROMPTS } from "@/lib/constants/onboarding-chat";
import { calculateReadinessScore } from "@/lib/matching/compatibility";

export interface AIGeneratedProfile {
  short_bio: string;
  long_bio: string;
  personality_tags: string[];
  interest_tags: string[];
  values_tags: string[];
  compatibility_summary: string;
  readiness_score: number;
  missing_items: string[];
}

const PERSONALITY_KEYWORDS: Record<string, string[]> = {
  thoughtful: ["think", "reflect", "consider", "mindful"],
  adventurous: ["travel", "explore", "adventure", "outdoor"],
  family_oriented: ["family", "parents", "home", "roots"],
  ambitious: ["career", "goal", "ambition", "growth", "success"],
  spiritual: ["spiritual", "faith", "meditation", "temple"],
  creative: ["art", "music", "creative", "write", "design"],
  grounded: ["simple", "honest", "genuine", "authentic", "real"],
  caring: ["care", "kind", "empathy", "support", "nurture"],
};

const INTEREST_KEYWORDS: Record<string, string[]> = {
  trekking: ["trek", "hike", "mountain", "himalaya"],
  cooking: ["cook", "food", "recipe", "kitchen"],
  reading: ["read", "book", "literature"],
  fitness: ["gym", "yoga", "fitness", "sport"],
  music: ["music", "sing", "instrument"],
  travel: ["travel", "explore", "journey"],
  photography: ["photo", "camera", "capture"],
  farming: ["farm", "agriculture", "village"],
};

const VALUES_KEYWORDS: Record<string, string[]> = {
  trust: ["trust", "honest", "integrity"],
  communication: ["communicate", "talk", "open", "express"],
  respect: ["respect", "dignity", "equality"],
  commitment: ["commit", "loyal", "dedicated", "serious"],
  growth: ["grow", "learn", "evolve", "improve"],
  balance: ["balance", "harmony", "peace"],
  tradition: ["tradition", "culture", "heritage", "custom"],
  independence: ["independent", "freedom", "space"],
};

function extractTags(text: string, keywordMap: Record<string, string[]>): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((k) => lower.includes(k))) {
      tags.push(tag.replace(/_/g, " "));
    }
  }
  return tags.slice(0, 5);
}

function generateShortBio(answers: Record<string, string>, intent: string): string {
  const about = answers.about_self ?? "";
  const looking = answers.looking_for ?? "";
  const firstSentence = about.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 20) {
    return firstSentence.slice(0, 120) + (firstSentence.length > 120 ? "…" : "");
  }
  const intentLabels: Record<string, string> = {
    exploring: "open to meaningful connections",
    serious: "looking for a serious relationship",
    marriage: "ready to find a life partner",
  };
  return `A genuine soul from Uttarakhand, ${intentLabels[intent] ?? "open to connection"}. ${looking.slice(0, 60)}`;
}

function generateLongBio(answers: Record<string, string>): string {
  const parts = ONBOARDING_PROMPTS.map((p) => {
    const answer = answers[p.key];
    if (!answer) return null;
    return answer.trim();
  }).filter(Boolean);

  if (parts.length === 0) {
    return "I'm on Saathini to find a genuine connection rooted in trust and shared values.";
  }

  return parts.join(" ").slice(0, 500);
}

function suggestMissingItems(answers: Record<string, string>): string[] {
  const missing: string[] = [];
  if (!answers.about_self) missing.push("Tell us more about yourself");
  if (!answers.partner_fit) missing.push("Describe your ideal partner");
  if (!answers.future_plans) missing.push("Share your future plans");
  if (!answers.relationship_values) missing.push("Add your relationship values");
  return missing;
}

export function generateAIProfile(
  answers: Record<string, string>,
  intent: string
): AIGeneratedProfile {
  const allText = Object.values(answers).join(" ");
  const personality_tags = extractTags(allText, PERSONALITY_KEYWORDS);
  const interest_tags = extractTags(allText, INTEREST_KEYWORDS);
  const values_tags = extractTags(allText, VALUES_KEYWORDS);

  if (personality_tags.length === 0) personality_tags.push("genuine", "warm");
  if (interest_tags.length === 0) interest_tags.push("connecting with people");
  if (values_tags.length === 0) values_tags.push("trust", "respect");

  const short_bio = generateShortBio(answers, intent);
  const long_bio = generateLongBio(answers);
  const readiness_score = calculateReadinessScore(answers);

  const compatibility_summary = `Someone who values ${values_tags.slice(0, 2).join(" and ")}, with a ${personality_tags[0] ?? "genuine"} approach to relationships. Best matched with partners who share similar life goals and regional roots.`;

  return {
    short_bio,
    long_bio,
    personality_tags,
    interest_tags,
    values_tags,
    compatibility_summary,
    readiness_score,
    missing_items: suggestMissingItems(answers),
  };
}

import { getLocalFallbackReply, resolveReplyLanguage, type UserLanguage } from "@/lib/ai/language";

export function getAIResponse(
  promptKey: string,
  userMessage: string,
  preferredLanguage?: UserLanguage | null
): string {
  const lang = resolveReplyLanguage(userMessage, preferredLanguage);
  return getLocalFallbackReply(promptKey, lang);
}
