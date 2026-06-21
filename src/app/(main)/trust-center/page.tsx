"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { TrustCenterPanel } from "@/components/trust/trust-center";
import { getVerificationOverview } from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";
import type { VerificationOverview } from "@/types";

export default function TrustCenterPage() {
  const { t, hydrated } = useTranslation();
  const [overview, setOverview] = useState<VerificationOverview | null>(null);

  useEffect(() => {
    getVerificationOverview().then(setOverview);
  }, []);

  if (!hydrated || !overview) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/profile" title={t("trust_center")} />
        <p className="animate-pulse px-4 py-12 text-center text-sm text-muted-foreground">
          {t("loading_profile")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader
        showBack
        backHref="/profile"
        title={t("trust_center")}
        subtitle={t("trust_center_subtitle")}
      />
      <div className="px-4 py-4">
        <TrustCenterPanel overview={overview} reportCount={0} />
      </div>
    </div>
  );
}
