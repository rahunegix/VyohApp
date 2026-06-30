"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FaceVerificationCapture } from "@/components/verification/face-verification-capture";
import { getVerificationOverview } from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { ShieldCheck, Clock } from "lucide-react";

export default function FaceVerificationPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [verified, setVerified] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    getVerificationOverview().then((overview) => {
      if (overview.verification.face_verified) setAlreadyVerified(true);
      else if (overview.faceRequest?.status === "pending_review") setPendingReview(true);
    });
  }, []);

  if (!hydrated) return null;

  if (alreadyVerified) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/trust-center" title={t("face_verification")} />
        <div className="mx-4 mt-12 rounded-2xl border border-success/20 bg-success/10 px-6 py-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-success" />
          <p className="mt-4 text-lg font-bold">{t("face_already_verified")}</p>
          <Button className="mt-6" onClick={() => router.push("/trust-center")}>
            {t("back_to_trust_center")}
          </Button>
        </div>
      </div>
    );
  }

  if (pendingReview) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/trust-center" title={t("face_verification")} />
        <div className="mx-4 mt-12 rounded-2xl border border-warning/20 bg-warning/10 px-6 py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-warning" />
          <p className="mt-4 text-lg font-bold">{t("verify_status_pending_review")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("face_review_submitted")}</p>
          <Button className="mt-6" onClick={() => router.push("/trust-center")}>
            {t("back_to_trust_center")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader
        showBack
        backHref="/trust-center"
        title={t("face_verification")}
        subtitle={t("verification_subtitle")}
      />
      <div className="px-4 py-6">
        <FaceVerificationCapture
          onVerified={() => setVerified(true)}
          onPendingReview={() => setPendingReview(true)}
          showStartButton={!verified}
        />
        {(verified || pendingReview) && (
          <Button className="mt-8 w-full" size="lg" onClick={() => router.push("/trust-center")}>
            {t("back_to_trust_center")}
          </Button>
        )}
      </div>
    </div>
  );
}
