"use server";

import {
  buildProfileFromAnswers,
  getOnboardingChatReply,
  analyzeCompatibility,
  analyzeReadiness,
  coachProfile,
  generateConversationStarters,
  explainMatch,
  moderateContent,
  analyzeTrust,
  parseNaturalLanguageSearch,
  askSaathiniAssistant,
  suggestBio,
} from "@/lib/ai";
import type { BioSuggestContext } from "@/lib/ai";
import { getCachedAI, setCachedAI, getAuthIds } from "@/services/ai-cache";
import type { Profile } from "@/types";

export async function aiBuildProfile(answers: Record<string, string>, intent: string) {
  const ids = await getAuthIds();
  const { data, model } = await buildProfileFromAnswers(answers, intent);

  if (ids?.userId && ids?.profileId) {
    await setCachedAI(
      "ai_profile_summaries",
      { user_id: ids.userId, profile_id: ids.profileId },
      data,
      model
    );
  }

  return { data, model };
}

export async function aiOnboardingReply(
  promptKey: string,
  userAnswer: string,
  questionLabel: string,
  options?: {
    intent?: string | null;
    stepIndex?: number;
    totalSteps?: number;
    preferredLanguage?: "english" | "hindi" | "hinglish" | null;
  }
) {
  return getOnboardingChatReply(promptKey, userAnswer, questionLabel, options);
}

export async function aiGetCompatibility(profileA: Profile, profileB: Profile) {
  const aId = profileA.id;
  const bId = profileB.id;
  const [pa, pb] = aId < bId ? [aId, bId] : [bId, aId];

  const cached = await getCachedAI<{ score: number; strengths: string[]; concerns: string[]; summary: string }>(
    "ai_compatibility",
    { profile_a_id: pa, profile_b_id: pb }
  );
  if (cached) return { data: cached.data, model: cached.model, cached: true };

  const { data, model } = await analyzeCompatibility(profileA, profileB);
  const ids = await getAuthIds();
  await setCachedAI(
    "ai_compatibility",
    { user_id: ids?.userId, profile_a_id: pa, profile_b_id: pb },
    data,
    model
  );
  return { data, model, cached: false };
}

export async function aiGetReadiness(answers: Record<string, string>, intent: string) {
  const ids = await getAuthIds();
  if (ids?.profileId) {
    const cached = await getCachedAI("ai_readiness", { profile_id: ids.profileId });
    if (cached) return { data: cached.data, model: cached.model, cached: true };
  }

  const { data, model } = await analyzeReadiness(answers, intent);
  if (ids?.userId && ids?.profileId) {
    await setCachedAI("ai_readiness", { user_id: ids.userId, profile_id: ids.profileId }, data, model);
  }
  return { data, model, cached: false };
}

export async function aiGetProfileCoach(profile: Partial<Profile>, photoCount: number) {
  const { data, model } = await coachProfile(profile, photoCount);
  const ids = await getAuthIds();
  if (ids?.userId && ids?.profileId) {
    await setCachedAI("ai_recommendations", { user_id: ids.userId, profile_id: ids.profileId }, data, model);
  }
  return { data, model };
}

export async function aiGetConversationStarters(profileA: Profile, profileB: Profile) {
  const [pa, pb] = profileA.id < profileB.id ? [profileA.id, profileB.id] : [profileB.id, profileA.id];
  const cached = await getCachedAI("ai_conversation_starters", { profile_a_id: pa, profile_b_id: pb });
  if (cached) return { data: cached.data, model: cached.model };

  const { data, model } = await generateConversationStarters(profileA, profileB);
  const ids = await getAuthIds();
  await setCachedAI("ai_conversation_starters", { user_id: ids?.userId, profile_a_id: pa, profile_b_id: pb }, data, model);
  return { data, model };
}

export async function aiGetMatchExplanation(profileA: Profile, profileB: Profile, score: number) {
  const [pa, pb] = profileA.id < profileB.id ? [profileA.id, profileB.id] : [profileB.id, profileA.id];
  const cached = await getCachedAI("ai_match_explanations", { profile_a_id: pa, profile_b_id: pb });
  if (cached) return { data: cached.data, model: cached.model };

  const { data, model } = await explainMatch(profileA, profileB, score);
  const ids = await getAuthIds();
  await setCachedAI("ai_match_explanations", { user_id: ids?.userId, profile_a_id: pa, profile_b_id: pb }, data, model);
  return { data, model };
}

export async function aiModerate(content: string, context: "message" | "profile" | "report") {
  const { data, model } = await moderateContent(content, context);
  const ids = await getAuthIds();
  if (data.recommend_review && ids?.userId) {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    await supabase.from("ai_moderation_flags").insert({
      user_id: ids.userId,
      entity_type: context,
      json_result: data,
      model_used: model,
      status: "pending",
    });
  }
  return { data, model };
}

export async function aiGetTrust(factors: Parameters<typeof analyzeTrust>[0]) {
  const { data, model } = await analyzeTrust(factors);
  const ids = await getAuthIds();
  if (ids?.userId && ids?.profileId) {
    await setCachedAI("ai_trust_scores", { user_id: ids.userId, profile_id: ids.profileId }, data, model);
  }
  return { data, model };
}

export async function aiSearch(query: string) {
  return parseNaturalLanguageSearch(query);
}

export async function aiAssistant(message: string, context?: string) {
  return askSaathiniAssistant(message, context);
}

export async function aiSuggestBio(context: BioSuggestContext) {
  return suggestBio(context);
}
