"use client";

import Link from "next/link";
import {
  Shield, Phone, ScanFace, IdCard, Users, CheckCircle2, Circle, ChevronRight, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrustLevel } from "@/lib/helpers/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { VerificationOverview, VerificationRequestStatus } from "@/types";

const BADGE_CONFIG = [
  { key: "mobile_verified" as const, labelKey: "verify_mobile", icon: Phone },
  { key: "face_verified" as const, labelKey: "verify_face", icon: ScanFace },
  { key: "id_verified" as const, labelKey: "verify_id", icon: IdCard, actionHref: "/trust-center/verify/id" },
  {
    key: "family_verified" as const,
    labelKey: "verify_reference",
    icon: Users,
    actionHref: "/trust-center/verify/reference",
  },
];

function statusLabelKey(status: VerificationRequestStatus): string {
  const map: Record<VerificationRequestStatus, string> = {
    pending_otp: "verify_status_pending_otp",
    otp_verified: "verify_status_otp_verified",
    pending_review: "verify_status_pending_review",
    pending_team_call: "verify_status_pending_call",
    verified: "verify_status_verified",
    rejected: "verify_status_rejected",
  };
  return map[status];
}

interface TrustCenterProps {
  overview: VerificationOverview;
  reportCount?: number;
}

export function TrustCenterPanel({ overview, reportCount = 0 }: TrustCenterProps) {
  const { t } = useTranslation();
  const { verification, trustScore, profileCompleteness, idRequest, referenceRequest } = overview;
  const trust = getTrustLevel(trustScore);

  const getPendingStatus = (key: typeof BADGE_CONFIG[number]["key"]) => {
    if (key === "id_verified" && idRequest && !verification.id_verified) {
      return idRequest.status;
    }
    if (key === "family_verified" && referenceRequest && !verification.family_verified) {
      return referenceRequest.status;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("trust_score")}
            </CardTitle>
            <span className="text-3xl font-bold text-primary">{trustScore}</span>
          </div>
          <p className={`text-sm font-medium ${trust.color}`}>{trust.label}</p>
        </CardHeader>
        <CardContent>
          <ProgressBar value={trustScore} showLabel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("verification_badges")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {BADGE_CONFIG.map(({ key, labelKey, icon: Icon, actionHref }) => {
            const verified = verification[key];
            const pendingStatus = getPendingStatus(key);
            const showAction = !verified && actionHref;

            return (
              <div key={key} className="rounded-xl border border-border/50 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      verified ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${verified ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t(labelKey)}</p>
                    {pendingStatus && (
                      <Badge variant="secondary" className="mt-1 gap-1 text-[10px]">
                        <Clock className="h-3 w-3" />
                        {t(statusLabelKey(pendingStatus))}
                      </Badge>
                    )}
                  </div>
                  {verified ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                </div>
                {showAction && (
                  <Link
                    href={actionHref}
                    className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {t("verify_now")}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("profile_completeness")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar value={profileCompleteness} color="success" showLabel />
        </CardContent>
      </Card>

      {reportCount === 0 && (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-success">
          {t("trust_no_reports")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("safety_tips")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• {t("safety_tip_1")}</p>
          <p>• {t("safety_tip_2")}</p>
          <p>• {t("safety_tip_3")}</p>
          <p>• {t("safety_tip_4")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
