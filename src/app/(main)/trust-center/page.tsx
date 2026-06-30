"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { TrustCenterPanel } from "@/components/trust/trust-center";
import { getVerificationOverview } from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";
import type { VerificationOverview } from "@/types";

export default function TrustCenterPage() {
  const { t, hydrated } = useTranslation();
  const [overview, setOverview] = useState<VerificationOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVerificationOverview()
      .then(setOverview)
      .finally(() => setLoading(false));
  }, []);

  if (!hydrated || loading) {
    return (
      <PageSkeleton
        variant="settings"
        title={hydrated ? t("trust_center") : undefined}
        showBack
        withHeader={hydrated}
      />
    );
  }

  if (!overview) {
    return (
      <PageSkeleton variant="settings" title={t("trust_center")} showBack />
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
