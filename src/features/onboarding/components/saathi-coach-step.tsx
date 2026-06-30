"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { SaathiPresence } from "@/components/saathi/saathi-presence";
import { getSaathiAcknowledgment } from "@/config/ai";
import { ONBOARDING_CHAT_PROMPTS } from "@/lib/constants/onboarding-chat";
import { getLocalizedPrompts } from "@/lib/i18n";
import { useLanguageStore } from "@/store/language";
import { MOTION } from "@/design/tokens";
import { SAATHI_COACH_STEPS } from "@/config/onboarding";

interface SaathiCoachStepProps {
  stepIndex: number;
  selectedChips: string[];
  onToggleChip: (id: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
  multiSelect?: boolean;
}

export function SaathiCoachStep({
  stepIndex,
  selectedChips,
  onToggleChip,
  onContinue,
  onBack,
  continueDisabled,
  multiSelect = true,
}: SaathiCoachStepProps) {
  const { language } = useLanguageStore();
  const prompts = useMemo(() => getLocalizedPrompts(language), [language]);
  const stepKey = SAATHI_COACH_STEPS[stepIndex]?.key ?? "about_self";
  const prompt = prompts.find((p) => p.key === stepKey) ?? ONBOARDING_CHAT_PROMPTS[stepIndex];
  const ack = getSaathiAcknowledgment(stepKey, stepIndex);

  if (!prompt) return null;

  return (
    <div className="flex flex-col gap-6">
      <SaathiPresence message={stepIndex === 0 ? prompt.greeting : ack} />

      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.normal / 1000 }}
      >
        <h3 className="text-lg font-bold tracking-tight">{prompt.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {multiSelect ? "Choose all that apply" : "Pick one"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {prompt.chips.map((chip) => (
              <motion.div
                key={chip.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: MOTION.fast / 1000 }}
              >
                <SelectionChip
                  selected={selectedChips.includes(chip.id)}
                  onClick={() => onToggleChip(chip.id)}
                  label={chip.label}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <Button
        size="lg"
        className="w-full"
        onClick={onContinue}
        disabled={continueDisabled ?? selectedChips.length === 0}
      >
        Continue
      </Button>
      {onBack && stepIndex > 0 && (
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  );
}
