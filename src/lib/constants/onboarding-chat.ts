export interface OnboardingChipOption {
  id: string;
  label: string;
}

export interface OnboardingPromptConfig {
  key: string;
  label: string;
  greeting: string;
  placeholder: string;
  chips: OnboardingChipOption[];
  multiSelect?: boolean;
}

export const ONBOARDING_CHAT_PROMPTS: OnboardingPromptConfig[] = [
  {
    key: "about_self",
    label: "Tell us about yourself",
    greeting: "Hi! I'm your Saathini profile assistant. Let's build your profile together — it'll only take a minute. First, what best describes you?",
    placeholder: "Or type something personal…",
    multiSelect: true,
    chips: [
      { id: "rooted", label: "Rooted in Uttarakhand" },
      { id: "career", label: "Career focused" },
      { id: "family", label: "Family oriented" },
      { id: "outdoors", label: "Love trekking & outdoors" },
      { id: "spiritual", label: "Spiritual & grounded" },
      { id: "creative", label: "Creative & expressive" },
      { id: "simple", label: "Simple & authentic" },
      { id: "warm", label: "Warm & caring" },
    ],
  },
  {
    key: "looking_for",
    label: "What are you looking for right now?",
    greeting: "Got it. What are you hoping to find on Saathini?",
    placeholder: "Describe in your own words…",
    chips: [
      { id: "meaningful", label: "Meaningful connection" },
      { id: "serious", label: "Serious commitment" },
      { id: "partner", label: "A life partner" },
      { id: "values", label: "Shared values" },
      { id: "slow", label: "Taking it slow" },
      { id: "companion", label: "A genuine companion" },
    ],
  },
  {
    key: "partner_fit",
    label: "What kind of partner fits your life?",
    greeting: "What qualities matter most in someone you'd want beside you?",
    placeholder: "Add anything else that matters…",
    multiSelect: true,
    chips: [
      { id: "kind", label: "Kind & empathetic" },
      { id: "ambitious", label: "Ambitious & driven" },
      { id: "family_minded", label: "Family-minded" },
      { id: "balanced", label: "Modern yet traditional" },
      { id: "communicator", label: "Great communicator" },
      { id: "roots", label: "Shares regional roots" },
      { id: "honest", label: "Honest & loyal" },
    ],
  },
  {
    key: "future_plans",
    label: "What are your future plans?",
    greeting: "Where do you see yourself heading in the next few years?",
    placeholder: "Share your vision…",
    multiSelect: true,
    chips: [
      { id: "stay_uk", label: "Build life in Uttarakhand" },
      { id: "relocate", label: "Open to relocating" },
      { id: "family_plan", label: "Want to start a family" },
      { id: "career_growth", label: "Focus on career growth" },
      { id: "close_family", label: "Stay close to family" },
      { id: "explore", label: "Still figuring it out" },
    ],
  },
  {
    key: "relationship_values",
    label: "What matters most in a relationship?",
    greeting: "What would make a relationship feel right for you?",
    placeholder: "Anything else you value…",
    multiSelect: true,
    chips: [
      { id: "trust", label: "Trust & honesty" },
      { id: "communication", label: "Open communication" },
      { id: "respect", label: "Mutual respect" },
      { id: "goals", label: "Shared life goals" },
      { id: "support", label: "Emotional support" },
      { id: "space", label: "Independence & space" },
      { id: "growth", label: "Growing together" },
    ],
  },
  {
    key: "family_involvement",
    label: "Family involvement in your journey?",
    greeting: "Last one — how would you like family to be part of this?",
    placeholder: "Share your preference…",
    chips: [
      { id: "active", label: "Yes, actively involved" },
      { id: "moderate", label: "Moderate involvement" },
      { id: "when_ready", label: "Only when I'm ready" },
      { id: "independent", label: "Prefer my own pace" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
];

// Keep legacy export for profile generation
export const ONBOARDING_PROMPTS = ONBOARDING_CHAT_PROMPTS.map((p) => ({
  key: p.key,
  label: p.label,
  placeholder: p.placeholder,
}));
