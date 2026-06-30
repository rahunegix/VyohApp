import { ONBOARDING_CHAT_PROMPTS, type OnboardingPromptConfig } from "@/lib/constants/onboarding-chat";
import type { AppLanguage } from "./languages";

type PromptTranslations = Record<
  string,
  {
    label: string;
    greeting: string;
    placeholder: string;
    chips: Record<string, string>;
  }
>;

const TRANSLATIONS: Record<AppLanguage, PromptTranslations> = {
  en: {
    about_self: {
      label: "Tell us about yourself",
      greeting:
        "Hi! I'm your Saathini profile assistant. Let's build your profile together — it'll only take a minute. First, what best describes you?",
      placeholder: "Or type something personal…",
      chips: {
        rooted: "Rooted in Uttarakhand",
        career: "Career focused",
        family: "Family oriented",
        outdoors: "Love trekking & outdoors",
        spiritual: "Spiritual & grounded",
        creative: "Creative & expressive",
        simple: "Simple & authentic",
        warm: "Warm & caring",
      },
    },
    looking_for: {
      label: "What are you looking for right now?",
      greeting: "Got it. What are you hoping to find on Saathini?",
      placeholder: "Describe in your own words…",
      chips: {
        meaningful: "Meaningful connection",
        serious: "Serious commitment",
        partner: "A life partner",
        values: "Shared values",
        slow: "Taking it slow",
        companion: "A genuine companion",
      },
    },
    partner_fit: {
      label: "What kind of partner fits your life?",
      greeting: "What qualities matter most in someone you'd want beside you?",
      placeholder: "Add anything else that matters…",
      chips: {
        kind: "Kind & empathetic",
        ambitious: "Ambitious & driven",
        family_minded: "Family-minded",
        balanced: "Modern yet traditional",
        communicator: "Great communicator",
        roots: "Shares regional roots",
        honest: "Honest & loyal",
      },
    },
    future_plans: {
      label: "What are your future plans?",
      greeting: "Where do you see yourself heading in the next few years?",
      placeholder: "Share your vision…",
      chips: {
        stay_uk: "Build life in Uttarakhand",
        relocate: "Open to relocating",
        family_plan: "Want to start a family",
        career_growth: "Focus on career growth",
        close_family: "Stay close to family",
        explore: "Still figuring it out",
      },
    },
    relationship_values: {
      label: "What matters most in a relationship?",
      greeting: "What would make a relationship feel right for you?",
      placeholder: "Anything else you value…",
      chips: {
        trust: "Trust & honesty",
        communication: "Open communication",
        respect: "Mutual respect",
        goals: "Shared life goals",
        support: "Emotional support",
        space: "Independence & space",
        growth: "Growing together",
      },
    },
    family_involvement: {
      label: "Family involvement in your journey?",
      greeting: "Last one — how would you like family to be part of this?",
      placeholder: "Share your preference…",
      chips: {
        active: "Yes, actively involved",
        moderate: "Moderate involvement",
        when_ready: "Only when I'm ready",
        independent: "Prefer my own pace",
        unsure: "Not sure yet",
      },
    },
  },
  hi: {
    about_self: {
      label: "अपने बारे में बताएं",
      greeting:
        "नमस्ते! मैं आपका Saathini प्रोफ़ाइल असिस्टेंट हूँ। चलिए मिलकर आपकी प्रोफ़ाइल बनाते हैं — बस एक मिनट लगेगा। सबसे पहले, आपको क्या सबसे अच्छे से describe करता है?",
      placeholder: "या कुछ अपने बारे में लिखें…",
      chips: {
        rooted: "उत्तराखंड से जुड़ा हुआ",
        career: "करियर पर फोकस",
        family: "परिवार प्रधान",
        outdoors: "ट्रेकिंग और प्रकृति पसंद",
        spiritual: "आध्यात्मिक और grounded",
        creative: "रचनात्मक और अभिव्यंजक",
        simple: "सादा और genuine",
        warm: "गर्मजोशी भरा",
      },
    },
    looking_for: {
      label: "अभी आप क्या ढूँढ रहे हैं?",
      greeting: "समझ गया। Saathini पर आप क्या पाना चाहते हैं?",
      placeholder: "अपने शब्दों में बताएं…",
      chips: {
        meaningful: "सार्थक जुड़ाव",
        serious: "गंभीर रिश्ता",
        partner: "जीवनसाथी",
        values: "साझा मूल्य",
        slow: "धीरे-धीरे आगे बढ़ना",
        companion: "एक सच्चा साथी",
      },
    },
    partner_fit: {
      label: "कैसा साथी आपकी ज़िंदगी में फिट होगा?",
      greeting: "ऐसा साथी चाहिए जिसमें कौन-से गुण सबसे ज़रूरी हैं?",
      placeholder: "और कुछ जो मायने रखता हो…",
      chips: {
        kind: "दयालु और समझदार",
        ambitious: "महत्वाकांक्षी",
        family_minded: "परिवार-केंद्रित",
        balanced: "आधुनिक पर पारंपरिक",
        communicator: "अच्छा संवादकर्ता",
        roots: "क्षेत्रीय जड़ें साझा",
        honest: "ईमानदार और वफ़ादार",
      },
    },
    future_plans: {
      label: "आपकी आगे की योजनाएँ?",
      greeting: "अगले कुछ सालों में आप खुद को कहाँ देखते हैं?",
      placeholder: "अपनी सोच साझा करें…",
      chips: {
        stay_uk: "उत्तराखंड में जीवन बनाना",
        relocate: "स्थानांतर के लिए तैयार",
        family_plan: "परिवार शुरू करना चाहता/चाहती",
        career_growth: "करियर पर ध्यान",
        close_family: "परिवार के करीब रहना",
        explore: "अभी सोच रहा/रही हूँ",
      },
    },
    relationship_values: {
      label: "रिश्ते में सबसे ज़रूरी क्या है?",
      greeting: "कैसा रिश्ता आपके लिए सही लगेगा?",
      placeholder: "और क्या मायने रखता है…",
      chips: {
        trust: "विश्वास और ईमानदारी",
        communication: "खुली बातचीत",
        respect: "आपसी सम्मान",
        goals: "साझा जीवन लक्ष्य",
        support: "भावनात्मक सहारा",
        space: "स्वतंत्रता और space",
        growth: "साथ में बढ़ना",
      },
    },
    family_involvement: {
      label: "परिवार की भूमिका?",
      greeting: "आखिरी सवाल — इस सफ़र में परिवार कितना शामिल हो?",
      placeholder: "अपनी पसंद बताएं…",
      chips: {
        active: "हाँ, सक्रिय रूप से",
        moderate: "थोड़ी भूमिका",
        when_ready: "जब मैं तैयार हूँ",
        independent: "अपनी रफ़्तार पर",
        unsure: "अभी पता नहीं",
      },
    },
  },
  hinglish: {
    about_self: {
      label: "Apne baare mein batao",
      greeting:
        "Namaste! Main aapka Saathini profile assistant hoon. Chaliye milkar aapki profile banate hain — bas ek minute lagega. Pehle, aapko kya sabse achhe se describe karta hai?",
      placeholder: "Ya kuch apne baare mein likho…",
      chips: {
        rooted: "Uttarakhand se juda hua",
        career: "Career focused",
        family: "Family oriented",
        outdoors: "Trekking aur nature pasand",
        spiritual: "Spiritual aur grounded",
        creative: "Creative aur expressive",
        simple: "Simple aur genuine",
        warm: "Warm aur caring",
      },
    },
    looking_for: {
      label: "Abhi aap kya dhoondh rahe ho?",
      greeting: "Samajh gaya. Saathini par aap kya paana chahte ho?",
      placeholder: "Apne shabdon mein batao…",
      chips: {
        meaningful: "Meaningful connection",
        serious: "Serious commitment",
        partner: "Life partner",
        values: "Shared values",
        slow: "Slowly aage badhna",
        companion: "Ek genuine companion",
      },
    },
    partner_fit: {
      label: "Kaisa partner aapki life mein fit hoga?",
      greeting: "Aise partner mein kaunse qualities sabse important hain?",
      placeholder: "Aur kuch jo matter karta ho…",
      chips: {
        kind: "Kind aur empathetic",
        ambitious: "Ambitious aur driven",
        family_minded: "Family-minded",
        balanced: "Modern par traditional bhi",
        communicator: "Achha communicator",
        roots: "Regional roots share kare",
        honest: "Honest aur loyal",
      },
    },
    future_plans: {
      label: "Aapke future plans?",
      greeting: "Agle kuch saalon mein aap khud ko kahan dekhte ho?",
      placeholder: "Apni soch share karo…",
      chips: {
        stay_uk: "Uttarakhand mein life banana",
        relocate: "Relocate ke liye open",
        family_plan: "Family start karna chahta/chahti",
        career_growth: "Career growth par focus",
        close_family: "Family ke paas rehna",
        explore: "Abhi soch raha/rahi hoon",
      },
    },
    relationship_values: {
      label: "Relationship mein sabse important kya hai?",
      greeting: "Kaisa relationship aapke liye sahi lagega?",
      placeholder: "Aur kya matter karta hai…",
      chips: {
        trust: "Trust aur honesty",
        communication: "Open communication",
        respect: "Mutual respect",
        goals: "Shared life goals",
        support: "Emotional support",
        space: "Independence aur space",
        growth: "Saath mein grow karna",
      },
    },
    family_involvement: {
      label: "Family ki bhoomika?",
      greeting: "Aakhri sawaal — is safar mein family kitni involved ho?",
      placeholder: "Apni preference batao…",
      chips: {
        active: "Haan, actively involved",
        moderate: "Thodi involvement",
        when_ready: "Jab main ready hoon",
        independent: "Apni speed par",
        unsure: "Abhi pata nahi",
      },
    },
  },
};

export function getLocalizedPrompts(lang: AppLanguage): OnboardingPromptConfig[] {
  return ONBOARDING_CHAT_PROMPTS.map((base) => {
    const t = TRANSLATIONS[lang][base.key];
    if (!t) return base;
    return {
      ...base,
      label: t.label,
      greeting: t.greeting,
      placeholder: t.placeholder,
      chips: base.chips.map((c) => ({
        ...c,
        label: t.chips[c.id] ?? c.label,
      })),
    };
  });
}
