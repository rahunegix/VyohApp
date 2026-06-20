import { aiComplete, getAIProvider } from "@/lib/ai/providers/openai";
import { SAATHINI_SYSTEM_PROMPT } from "@/lib/ai/saathini-prompt";
import { generateAIProfile } from "@/lib/ai/profile-assistant";
import {
  resolveReplyLanguage,
  getLanguageReplyInstruction,
  type UserLanguage,
} from "@/lib/ai/language";

export interface BioSuggestContext {
  aiAnswers: Record<string, string>;
  intent: string;
  fullName?: string;
  education?: string;
  profession?: string;
  city?: string;
  district?: string;
  region?: string;
  preferredLanguage?: UserLanguage | null;
}

function getFirstPersonInstruction(lang: UserLanguage): string {
  switch (lang) {
    case "hindi":
      return `CRITICAL — FIRST PERSON ONLY: यह bio user खुद अपने बारे में लिख रहा/रही है। हमेशा "मैं" से शुरू करें या first person में लिखें। कभी भी "आप", "तुम", या दूसरे व्यक्ति (you) का प्रयोग न करें। गलत: "आप एक दयालु साथी की तलाश में हैं।" सही: "मैं एक दयालु और समझदार जीवनसाथी की तलाश में हूँ।"`;
    case "hinglish":
      return `CRITICAL — FIRST PERSON ONLY: User apne baare mein khud likh raha/rahi hai. Hamesha "main/mein" use karo — kabhi "aap/you" mat likho. Galat: "Aap ek caring partner dhoondh rahe ho." Sahi: "Main ek caring aur samajhdar life partner dhoondh raha/rahi hoon."`;
    case "english":
      return `CRITICAL — FIRST PERSON ONLY: The user is writing their own profile intro. Always use "I" and "my" — NEVER "you" or "your". Wrong: "You are looking for a kind partner." Right: "I'm looking for a kind and understanding life partner."`;
  }
}

function buildBioPrompt(ctx: BioSuggestContext): string {
  // UI-selected language always wins for bio generation
  const lang: UserLanguage =
    ctx.preferredLanguage ??
    resolveReplyLanguage(Object.values(ctx.aiAnswers).join(" "), null);
  const langInstruction = getLanguageReplyInstruction(lang);
  const firstPersonInstruction = getFirstPersonInstruction(lang);

  const details = [
    ctx.fullName && `Name: ${ctx.fullName}`,
    ctx.education && `Education: ${ctx.education}`,
    ctx.profession && `Profession: ${ctx.profession}`,
    ctx.city && `City: ${ctx.city}`,
    ctx.district && `District: ${ctx.district}`,
    ctx.region && `Region: ${ctx.region}`,
    `Intent on Saathini: ${ctx.intent}`,
    ...Object.entries(ctx.aiAnswers).map(([k, v]) => `${k}: ${v}`),
  ]
    .filter(Boolean)
    .join("\n");

  const firstName = ctx.fullName?.trim().split(/\s+/)[0];
  const nameRule = firstName
    ? `Include first name "${firstName}" naturally in first person (e.g. "Main ${firstName} hoon…" / "I'm ${firstName}…" / "मैं ${firstName} हूँ…"). Never third person like "${firstName} is…".`
    : "Do not invent a name — write in first person without a name.";

  return `Write a short profile bio (2-3 sentences, max 200 characters). This text appears on the user's own profile — they are introducing themselves.

${details}

${langInstruction}

${firstPersonInstruction}

${nameRule}

Rules: Warm, genuine, modern — not matrimonial-biodata style. Use only facts from above. Plain text only, no quotes or markdown.`;
}

function localBioFallback(ctx: BioSuggestContext): string {
  const profile = generateAIProfile(ctx.aiAnswers, ctx.intent);
  const firstName = ctx.fullName?.trim().split(/\s+/)[0];
  const parts: string[] = [];
  if (firstName) parts.push(`I'm ${firstName}.`);
  parts.push(profile.short_bio);
  if (ctx.profession) parts.push(`Working as ${ctx.profession}.`);
  if (ctx.city) parts.push(`Based in ${ctx.city}.`);
  return parts.join(" ").slice(0, 200);
}

export async function suggestBio(
  ctx: BioSuggestContext
): Promise<{ bio: string; model: string }> {
  if (!getAIProvider().isAvailable()) {
    return { bio: localBioFallback(ctx), model: "local" };
  }

  try {
    const result = await aiComplete(
      [
        { role: "system", content: SAATHINI_SYSTEM_PROMPT },
        { role: "user", content: buildBioPrompt(ctx) },
      ],
      { tier: "fast", maxTokens: 120 }
    );
    const bio = result.content.trim().replace(/^["']|["']$/g, "").slice(0, 500);
    return { bio: bio || localBioFallback(ctx), model: result.model };
  } catch {
    return { bio: localBioFallback(ctx), model: "local-fallback" };
  }
}
