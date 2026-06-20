export type UserLanguage = "hindi" | "hinglish" | "english";

/** Detect language from user message — supports Devanagari, Hinglish, and English. */
export function detectUserLanguage(text: string): UserLanguage {
  const trimmed = text.trim();
  if (!trimmed) return "english";

  // Devanagari script → Hindi
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return "hindi";
  }

  const lower = trimmed.toLowerCase();

  // Romanized Hindi / Hinglish markers
  const hinglishPattern =
    /\b(hu|hun|hoon|hai|hain|he|ho|mein|main|mera|meri|mere|hum|kya|kyu|kyun|aur|nahi|nahin|ni|chahta|chahti|chahte|karna|karti|karte|hota|hoti|hote|bahut|bohot|accha|achha|achhi|apna|apni|apne|yahan|wahan|jab|tab|abhi|sab|kuch|koi|kuchh|bhi|se|par|pe|ke|ki|ka|ko|ne|ek|do|teen|bahut|thoda|zyada|jahan|dilli|dehradun|uttarakhand|garhwal|kumaon)\b/i;

  const englishHeavy =
    /\b(the|and|is|are|was|with|for|that|this|have|from|they|been|would|about)\b/i.test(lower);

  if (hinglishPattern.test(lower)) {
    return englishHeavy ? "hinglish" : "hinglish";
  }

  return "english";
}

/** Pick reply language from user text + saved preference (chips-only → preference). */
export function resolveReplyLanguage(
  userAnswer: string,
  preferred?: UserLanguage | null
): UserLanguage {
  const trimmed = userAnswer.trim();
  if (!trimmed) return preferred ?? "hinglish";

  const detected = detectUserLanguage(trimmed);

  // Short chip-only answers in English labels — keep user's chosen language
  if (
    preferred &&
    preferred !== "english" &&
    detected === "english" &&
    trimmed.length < 40 &&
    !/[\u0900-\u097F]/.test(trimmed)
  ) {
    return preferred;
  }

  if (trimmed.length >= 4) return detected;
  return preferred ?? detected;
}

export function getLanguageReplyInstruction(lang: UserLanguage): string {
  switch (lang) {
    case "hindi":
      return `IMPORTANT: The user wrote in Hindi. You MUST reply entirely in Hindi using Devanagari script (हिंदी). Be natural and warm — like a trusted friend from Uttarakhand. Example tone: "बहुत अच्छा — आपका साफ़ जवाब आपकी प्रोफ़ाइल में अच्छे से जुड़ेगा।"`;
    case "hinglish":
      return `IMPORTANT: The user wrote in Hinglish (Hindi in Roman script). You MUST reply in the same Hinglish style — natural mix of Hindi and English in Roman letters. Example tone: "Bahut accha — aap software engineer hain, yeh aapki profile ko strong banata hai."`;
    case "english":
      return `Reply in clear, warm English.`;
  }
}

export function getLocalFallbackReply(
  promptKey: string,
  lang: UserLanguage
): string {
  const hindi: Record<string, string> = {
    about_self: "बहुत अच्छा — आपके बारे में यह जानकर अच्छा लगा। यह आपकी प्रोफ़ाइल में जुड़ जाएगा।",
    looking_for: "साफ़ है — इससे हम आपके लिए बेहतर मैच ढूँढ पाएँगे।",
    partner_fit: "अच्छी बात है — सही पार्टनर सिर्फ़ दिखावे से नहीं, जीवन की फिट से मिलता है।",
    future_plans: "आपकी सोच स्पष्ट है — इससे सही लोगों से जोड़ने में मदद मिलेगी।",
    relationship_values: "मज़बूत रिश्ते की नींव यही मूल्य होते हैं — अच्छा है।",
    family_involvement: "समझ गए — परिवार की भूमिका हमारे यहाँ मायने रखती है।",
  };

  const hinglish: Record<string, string> = {
    about_self: "Bahut accha — aapke baare mein yeh sun kar achha laga. Yeh aapki profile mein add ho jayega.",
    looking_for: "Clear hai — isse hum aapke liye better matches dhoondh payenge.",
    partner_fit: "Achhi baat hai — sahi partner sirf looks se nahi, life fit se milta hai.",
    future_plans: "Aapki soch clear hai — isse sahi logon se connect karne mein madad milegi.",
    relationship_values: "Strong values — yahi lasting relationships ki neev hote hain.",
    family_involvement: "Samajh gaye — family ki bhoomika hamare yahan matter karti hai.",
  };

  const english: Record<string, string> = {
    about_self: "Love that — it gives me a real sense of who you are.",
    looking_for: "Clear intent helps us surface better matches for you.",
    partner_fit: "Great — compatibility is about fit, not just attraction.",
    future_plans: "Your direction matters. We'll factor this into matching.",
    relationship_values: "Strong values — that's the foundation of lasting bonds.",
    family_involvement: "Noted with care. Family context matters in our community.",
  };

  const map = lang === "hindi" ? hindi : lang === "hinglish" ? hinglish : english;
  return map[promptKey] ?? (lang === "hindi" ? "धन्यवाद — यह जानकारी काम आएगी।" : lang === "hinglish" ? "Shukriya — yeh info kaam aayegi." : "Thank you for sharing that.");
}
