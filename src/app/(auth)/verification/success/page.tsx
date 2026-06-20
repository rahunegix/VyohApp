"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/common/page-transition";
import { useOnboardingStore } from "@/store";
import { completeOnboarding } from "@/services/onboarding";
import { useTranslation } from "@/hooks/use-translation";

export default function VerificationSuccessPage() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const { t, hydrated } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setError("");

    const state = useOnboardingStore.getState();
    const result = await completeOnboarding(state);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      if (result.error.includes("Not signed in")) {
        router.push("/login");
      }
      return;
    }

    onboarding.reset();
    router.push("/discover");
  };

  if (!hydrated) return null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8">
      <FadeIn className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
        </motion.div>

        <h1 className="text-3xl font-bold">{t("all_set")}</h1>
        <p className="mt-3 text-muted-foreground max-w-xs mx-auto">{t("success_desc")}</p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="text-center">
            <Shield className="h-6 w-6 text-primary mx-auto" />
            <p className="mt-1 text-xs text-muted-foreground">{t("mobile_verified")}</p>
          </div>
          <div className="text-center">
            <Shield className="h-6 w-6 text-primary mx-auto" />
            <p className="mt-1 text-xs text-muted-foreground">{t("face_verified")}</p>
          </div>
        </div>
      </FadeIn>

      {error && (
        <p className="mt-4 text-center text-sm text-destructive px-4">{error}</p>
      )}

      <FadeIn delay={0.3} className="mt-12 w-full">
        <Button onClick={handleStart} loading={loading} className="w-full" size="lg">
          {t("start_discovering")}
        </Button>
      </FadeIn>
    </div>
  );
}
