"use client";

import Link from "next/link";
import {
  Shield, Phone, ScanFace, IdCard, Users, CheckCircle2, Circle, ChevronRight, Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SettingsMenuDivider, SettingsMenuGroup } from "@/components/ui/settings-menu";
import { getTrustLevel } from "@/lib/helpers/formatters";
import { cn } from "@/lib/helpers/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { VerificationOverview, VerificationRequestStatus } from "@/types";

const BADGE_CONFIG = [
  { key: "mobile_verified" as const, labelKey: "verify_mobile", icon: Phone },
  { key: "face_verified" as const, labelKey: "verify_face", icon: ScanFace, actionHref: "/trust-center/verify/face" },
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
  const { verification, trustScore, profileCompleteness, idRequest, referenceRequest, faceRequest } = overview;
  const trust = getTrustLevel(trustScore);

  const getPendingStatus = (key: (typeof BADGE_CONFIG)[number]["key"]) => {
    if (key === "id_verified" && idRequest && !verification.id_verified) {
      return idRequest.status;
    }
    if (key === "face_verified" && faceRequest && !verification.face_verified) {
      return faceRequest.status;
    }
    if (key === "family_verified" && referenceRequest && !verification.family_verified) {
      return referenceRequest.status;
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[6px] border border-primary/15 bg-gradient-to-br from-primary via-[#A61E1E] to-[#8B1A1A] p-5 text-white shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" fill="currentColor" />
              <p className="text-sm font-semibold uppercase tracking-wider text-white/85">{t("trust_score")}</p>
            </div>
            <p className="text-sm font-bold text-white/85">{trust.label}</p>
          </div>
          <span className="text-4xl font-extrabold tabular-nums">{trustScore}</span>
        </div>
        <div className="mt-4 [&_.bg-muted]:bg-white/25 [&_.bg-primary]:bg-white [&_.text-muted-foreground]:text-white/75">
          <ProgressBar value={trustScore} showLabel />
        </div>
      </div>

      <div>
        <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("verification_badges")}
        </h2>
        <SettingsMenuGroup>
          {BADGE_CONFIG.map(({ key, labelKey, icon: Icon, actionHref }, i) => {
            const verified = verification[key];
            const pendingStatus = getPendingStatus(key);
            const showAction = !verified && actionHref && (!pendingStatus || pendingStatus === "rejected");

            return (
              <div key={key}>
                {i > 0 && <SettingsMenuDivider />}
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px]",
                        verified ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t(labelKey)}</p>
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
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/35" />
                    )}
                  </div>
                  {showAction && (
                    <Link
                      href={actionHref}
                      className="mt-3 flex items-center justify-between rounded-[6px] bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      {t("verify_now")}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </SettingsMenuGroup>
      </div>

      <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
        <p className="mb-3 text-sm font-bold">{t("profile_completeness")}</p>
        <ProgressBar value={profileCompleteness} color="success" showLabel />
      </div>

      {reportCount === 0 && (
        <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">
          {t("trust_no_reports")}
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
        <p className="mb-3 text-sm font-bold">{t("safety_tips")}</p>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>• {t("safety_tip_1")}</p>
          <p>• {t("safety_tip_2")}</p>
          <p>• {t("safety_tip_3")}</p>
          <p>• {t("safety_tip_4")}</p>
        </div>
      </div>
    </div>
  );
}
