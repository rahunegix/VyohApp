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
      <div>
        <PageHeader showBack backHref="/profile" title={t("trust_center")} />
        <p className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">
          {t("loading_profile")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader showBack backHref="/profile" title={t("trust_center")} subtitle={t("trust_center_subtitle")} />
      <div className="px-4 py-4">
        <TrustCenterPanel overview={overview} reportCount={0} />
      </div>
    </div>
  );
}
