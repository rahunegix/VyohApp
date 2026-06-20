import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { ProfileBuilderOutputSchema, type ProfileBuilderOutput } from "@/lib/ai/schemas";
import { PROFILE_BUILDER_SYSTEM, PROFILE_BUILDER_USER, buildOnboardingUserMessage, SAATHINI_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { generateAIProfile, getAIResponse } from "@/lib/ai/profile-assistant";
import type { UserLanguage } from "@/lib/ai/language";

function localFallback(context: Record<string, string>, intent: string): ProfileBuilderOutput {
  const chatAnswers = Object.fromEntries(
    Object.entries(context).filter(([k]) => !k.startsWith("family_") && !k.startsWith("lifestyle_"))
  );
  const local = generateAIProfile(chatAnswers, intent);
  const name = context.full_name?.split(/\s+/)[0];
  const refinedShort = context.user_written_bio?.trim()
    ? context.user_written_bio.trim().slice(0, 200)
    : name
      ? `I'm ${name}${context.profession ? `, a ${context.profession.toLowerCase()}` : ""}${context.city ? ` from ${context.city}` : ""}. ${local.short_bio}`
      : local.short_bio;

  const detailParts = [
    refinedShort,
    context.education ? `Educated in ${context.education}.` : "",
    context.region ? `Rooted in ${context.region}.` : "",
    local.long_bio,
  ].filter(Boolean);

  return {
    short_bio: refinedShort.slice(0, 200),
    detailed_bio: detailParts.join(" ").slice(0, 600),
    personality_summary: local.compatibility_summary,
    personality_tags: local.personality_tags,
    interest_tags: local.interest_tags,
    relationship_style: intent === "marriage" ? "Commitment-oriented, family-aware" : "Open and intentional",
    communication_style: "Thoughtful and honest",
    lifestyle_tags: local.interest_tags.slice(0, 4),
    values_tags: local.values_tags,
  };
}

export async function buildProfileFromAnswers(
  context: Record<string, string>,
  intent: string
): Promise<{ data: ProfileBuilderOutput; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return { data: localFallback(context, intent), model: "local" };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: PROFILE_BUILDER_SYSTEM },
        { role: "user", content: PROFILE_BUILDER_USER(context, intent) },
      ],
      { tier: "primary", jsonMode: true, maxTokens: 1400 }
    );

    const parsed = ProfileBuilderOutputSchema.parse(parseAIJson(result.content));
    return { data: parsed, model: result.model };
  } catch {
    return { data: localFallback(context, intent), model: "local-fallback" };
  }
}

export async function getOnboardingChatReply(
  promptKey: string,
  userAnswer: string,
  questionLabel: string,
  options?: {
    intent?: string | null;
    stepIndex?: number;
    totalSteps?: number;
    preferredLanguage?: UserLanguage | null;
  }
): Promise<{ reply: string; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return {
      reply: getAIResponse(promptKey, userAnswer, options?.preferredLanguage),
      model: "local",
    };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: SAATHINI_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildOnboardingUserMessage({
            promptKey,
            questionLabel,
            userAnswer,
            intent: options?.intent,
            stepIndex: options?.stepIndex,
            totalSteps: options?.totalSteps,
            preferredLanguage: options?.preferredLanguage,
          }),
        },
      ],
      { tier: "fast", maxTokens: 150 }
    );
    return { reply: result.content, model: result.model };
  } catch {
    return {
      reply: getAIResponse(promptKey, userAnswer, options?.preferredLanguage),
      model: "local-fallback",
    };
  }
}
