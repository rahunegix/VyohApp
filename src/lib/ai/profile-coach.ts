import { aiComplete, getAIProvider, parseAIJson } from "@/lib/ai/providers/openai";
import { ProfileCoachOutputSchema, type ProfileCoachOutput } from "@/lib/ai/schemas";
import { PROFILE_COACH_SYSTEM } from "@/lib/ai/prompts";
import type { Profile } from "@/types";

function localCoach(profile: Partial<Profile>, photoCount: number): ProfileCoachOutput {
  const recs: ProfileCoachOutput["recommendations"] = [];
  if (photoCount < 2) recs.push({ type: "photo", priority: "high", message: "Add at least 2 clear photos with your face visible." });
  if (!profile.bio || profile.bio.length < 50) recs.push({ type: "bio", priority: "high", message: "Expand your bio — share what makes you unique." });
  if (!profile.personality_tags?.length) recs.push({ type: "interests", priority: "medium", message: "Add hobbies and interests people can connect with." });
  if (!profile.values_tags?.length) recs.push({ type: "values", priority: "medium", message: "Share what matters most to you in a relationship." });
  let score = 40;
  if (photoCount >= 2) score += 20;
  if (profile.bio && profile.bio.length > 50) score += 20;
  if (profile.education) score += 10;
  if (profile.profession) score += 10;
  return { completion_score: Math.min(100, score), recommendations: recs };
}

export async function coachProfile(
  profile: Partial<Profile>,
  photoCount: number
): Promise<{ data: ProfileCoachOutput; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return { data: localCoach(profile, photoCount), model: "local" };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: PROFILE_COACH_SYSTEM },
        {
          role: "user",
          content: `Profile: ${JSON.stringify(profile)}\nPhoto count: ${photoCount}\nReturn JSON: { completion_score, recommendations: [{ type, priority, message }] }`,
        },
      ],
      { tier: "fast", jsonMode: true, maxTokens: 600 }
    );
    const parsed = ProfileCoachOutputSchema.parse(parseAIJson(result.content));
    return { data: parsed, model: result.model };
  } catch {
    return { data: localCoach(profile, photoCount), model: "local-fallback" };
  }
}
