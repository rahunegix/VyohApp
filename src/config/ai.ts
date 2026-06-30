/** Saathi — AI personality & copy (single source of truth) */

export const SAATHI_NAME = "Saathi";

export const SAATHI_NEVER_SAY = ["AI", "Bot", "Assistant", "Chatbot", "GPT", "ChatGPT"] as const;

export const SAATHI_COPY = {
  greeting: {
    morning: (name: string) => `Good Morning ${name}`,
    afternoon: (name: string) => `Good Afternoon ${name}`,
    evening: (name: string) => `Welcome back, ${name}`,
    night: (name: string) => `Hope you're having a peaceful evening, ${name}`,
  },
  onboarding: {
    welcome: "I'll help you build a profile that genuinely represents you. This takes about three minutes.",
    genderConfirmed: {
      male: "Perfect. I'll show you women who genuinely fit you.",
      female: "Perfect. I'll show you men who genuinely fit you.",
      other: "Got it. I'll find people who genuinely fit you.",
    },
    photoNudge: "Adding one smiling photo usually helps people trust your profile.",
    error: "Let's fix this together.",
    reveal: "Here's the profile I've crafted for you.",
  },
  discover: {
    searching: "I'm finding people that genuinely fit you.",
    noResults: "I'm finding people who truly match your values.",
    noResultsAction: "Improve my profile",
    pickPrefix: "Saathi picked this profile because",
  },
  match: {
    title: "Looks like both of you would like to know each other.",
    subtitle: "Start with something meaningful.",
    action: "Open Chat",
  },
  chat: {
    starterIntro: "You both share something in common.",
    starterPrompt: "Try asking",
    wingmanWeak: "That opening usually receives fewer replies.",
    wingmanSuggest: "Try something more personal.",
  },
  profile: {
    coachTitle: "Profile Strength",
    visibilityGain: (pct: number) => `Estimated visibility increase +${pct}%`,
  },
  empty: {
    improve: "Improve",
  },
} as const;

/** Instant acknowledgments — no LLM per chip tap */
export const SAATHI_ACKNOWLEDGMENTS: Record<string, string[]> = {
  about_self: [
    "I love that — authenticity stands out.",
    "That tells me a lot about who you are.",
    "Beautiful. I'll weave this into your profile.",
  ],
  partner_fit: [
    "Clear preferences help me find better matches.",
    "I'll look for people who align with this.",
    "Noted — compatibility starts here.",
  ],
  relationship_values: [
    "Values matter most in lasting relationships.",
    "I'll prioritize people who share this.",
    "This will shape your matches beautifully.",
  ],
};

export function getSaathiAcknowledgment(promptKey: string, stepIndex: number): string {
  const pool = SAATHI_ACKNOWLEDGMENTS[promptKey] ?? SAATHI_ACKNOWLEDGMENTS.about_self;
  return pool[stepIndex % pool.length];
}

export function getTimeGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return SAATHI_COPY.greeting.morning(name);
  if (hour < 17) return SAATHI_COPY.greeting.afternoon(name);
  if (hour < 21) return SAATHI_COPY.greeting.evening(name);
  return SAATHI_COPY.greeting.night(name);
}
