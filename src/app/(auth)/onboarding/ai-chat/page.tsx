"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepShell } from "@/components/onboarding/onboarding-step-shell";
import { OnboardingChat, type ChatMessage } from "@/components/onboarding/onboarding-chat";
import { ONBOARDING_CHAT_PROMPTS } from "@/lib/constants/onboarding-chat";
import type { OnboardingChipOption } from "@/lib/constants/onboarding-chat";
import { getAIResponse } from "@/lib/ai/profile-assistant";
import { useOnboardingStore } from "@/store";
import { useLanguageStore } from "@/store/language";
import { getLocalizedPrompts } from "@/lib/i18n";
import { appLanguageToUserLanguage } from "@/lib/i18n/languages";
import { useTranslation } from "@/hooks/use-translation";

function buildAnswer(chipLabels: string[], customText: string): string {
  const parts = [...chipLabels];
  const trimmed = customText.trim();
  if (trimmed) parts.push(trimmed);
  return parts.join(". ");
}

async function fetchAIReply(
  promptKey: string,
  answer: string,
  questionLabel: string,
  intent: string | null,
  stepIndex: number,
  preferredLanguage: "english" | "hindi" | "hinglish"
) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "chat_reply",
        promptKey,
        userAnswer: answer,
        questionLabel,
        intent,
        stepIndex,
        totalSteps: ONBOARDING_CHAT_PROMPTS.length,
        preferredLanguage,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return (json.reply ?? json.data?.reply) as string;
    }
  } catch {
    // fallback
  }
  return getAIResponse(promptKey, answer, preferredLanguage);
}

export default function AIChatPage() {
  const router = useRouter();
  const { setAiAnswer, intent } = useOnboardingStore();
  const { language, detectAndSwitch } = useLanguageStore();
  const { t, hydrated } = useTranslation();
  const prompts = useMemo(() => getLocalizedPrompts(language), [language]);

  const [step, setStep] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ id: "welcome", role: "ai", text: prompts[0].greeting }];
      }
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{ id: "welcome", role: "ai", text: prompts[0].greeting }];
      }
      return prev;
    });
  }, [hydrated, language, prompts]);

  const currentPrompt = prompts[step];
  const isLastStep = step >= prompts.length - 1;

  const selectedLabels = currentPrompt.chips
    .filter((c) => selectedChips.includes(c.id))
    .map((c) => c.label);

  const canSend = selectedChips.length > 0 || input.trim().length > 0;

  const advanceStep = useCallback(
    async (answer: string, displayText: string, customText: string) => {
      if (customText.trim().length >= 4) {
        detectAndSwitch(customText);
      }

      const activeLang = appLanguageToUserLanguage(useLanguageStore.getState().language);
      const localizedPrompts = getLocalizedPrompts(useLanguageStore.getState().language);

      setAiAnswer(currentPrompt.key, answer);
      setMessages((m) => [...m, { id: `user-${step}`, role: "user", text: displayText }]);
      setSelectedChips([]);
      setInput("");
      setTyping(true);

      const aiResponse = await fetchAIReply(
        currentPrompt.key,
        answer,
        currentPrompt.label,
        intent,
        step,
        activeLang
      );
      setMessages((m) => [...m, { id: `ai-reply-${step}`, role: "ai", text: aiResponse }]);
      setTyping(false);

      if (!isLastStep) {
        await new Promise((r) => setTimeout(r, 400));
        const next = localizedPrompts[step + 1];
        setMessages((m) => [...m, { id: `ai-q-${step + 1}`, role: "ai", text: next.greeting }]);
        setStep((s) => s + 1);
      }
    },
    [currentPrompt, detectAndSwitch, intent, isLastStep, setAiAnswer, step]
  );

  const submitAnswer = useCallback(async () => {
    if (!canSend || typing) return;
    const answer = buildAnswer(selectedLabels, input);
    const displayText =
      selectedLabels.length > 0
        ? selectedLabels.join(" · ") + (input.trim() ? ` · ${input.trim()}` : "")
        : input.trim();
    await advanceStep(answer, displayText, input);
  }, [advanceStep, canSend, input, selectedLabels, typing]);

  const handleChipToggle = useCallback(
    (chip: OnboardingChipOption) => {
      if (typing) return;
      if (currentPrompt.multiSelect) {
        setSelectedChips((prev) =>
          prev.includes(chip.id) ? prev.filter((id) => id !== chip.id) : [...prev, chip.id]
        );
      } else {
        setSelectedChips((prev) => (prev.includes(chip.id) ? [] : [chip.id]));
      }
    },
    [currentPrompt.multiSelect, typing]
  );

  if (!hydrated) return null;

  return (
    <OnboardingStepShell
      backHref="/onboarding/gender"
    
      currentStep={2}
      flushContent
    >
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <OnboardingChat
          messages={messages}
          typing={typing}
          currentPrompt={currentPrompt}
          selectedChips={selectedChips}
          input={input}
          onChipToggle={handleChipToggle}
          onInputChange={setInput}
          onSend={submitAnswer}
          onFinish={() => router.push("/onboarding/photos")}
          isLastStep={isLastStep}
          canSend={canSend}
          stepAnswered={isLastStep && !typing && messages.some((m) => m.id === `user-${step}`)}
        />
      </div>
    </OnboardingStepShell>
  );
}
