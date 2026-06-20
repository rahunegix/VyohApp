import { NextResponse } from "next/server";
import {
  aiBuildProfile,
  aiOnboardingReply,
  aiGetCompatibility,
  aiGetReadiness,
  aiGetProfileCoach,
  aiGetConversationStarters,
  aiGetMatchExplanation,
  aiModerate,
  aiGetTrust,
  aiSearch,
  aiAssistant,
  aiSuggestBio,
} from "@/services/ai";
import type { Profile } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "chat_reply": {
        const { promptKey, userAnswer, questionLabel, intent, stepIndex, totalSteps, preferredLanguage } = body;
        const result = await aiOnboardingReply(promptKey, userAnswer, questionLabel, {
          intent, stepIndex, totalSteps, preferredLanguage,
        });
        return NextResponse.json(result);
      }

      case "profile_build": {
        const { answers, intent } = body;
        const result = await aiBuildProfile(answers, intent);
        return NextResponse.json(result);
      }

      case "compatibility": {
        const { profileA, profileB } = body as { profileA: Profile; profileB: Profile };
        const result = await aiGetCompatibility(profileA, profileB);
        return NextResponse.json(result);
      }

      case "readiness": {
        const { answers, intent } = body;
        const result = await aiGetReadiness(answers, intent);
        return NextResponse.json(result);
      }

      case "profile_coach": {
        const { profile, photoCount } = body;
        const result = await aiGetProfileCoach(profile, photoCount ?? 0);
        return NextResponse.json(result);
      }

      case "conversation_starters": {
        const { profileA, profileB } = body;
        const result = await aiGetConversationStarters(profileA, profileB);
        return NextResponse.json(result);
      }

      case "match_explanation": {
        const { profileA, profileB, score } = body;
        const result = await aiGetMatchExplanation(profileA, profileB, score);
        return NextResponse.json(result);
      }

      case "moderate": {
        const { content, context } = body;
        const result = await aiModerate(content, context ?? "message");
        return NextResponse.json(result);
      }

      case "trust": {
        const { factors } = body;
        const result = await aiGetTrust(factors);
        return NextResponse.json(result);
      }

      case "search": {
        const { query } = body;
        const result = await aiSearch(query);
        return NextResponse.json(result);
      }

      case "assistant": {
        const { message, context } = body;
        const result = await aiAssistant(message, context);
        return NextResponse.json(result);
      }

      case "bio_suggest": {
        const { aiAnswers, intent, fullName, education, profession, city, district, region, preferredLanguage } = body;
        const result = await aiSuggestBio({
          aiAnswers: aiAnswers ?? {},
          intent: intent ?? "serious",
          fullName,
          education,
          profession,
          city,
          district,
          region,
          preferredLanguage,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
