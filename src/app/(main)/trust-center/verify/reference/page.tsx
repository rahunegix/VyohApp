"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectPillRow } from "@/components/ui/selection-chip";
import {
  FAMILY_RELATION_OPTIONS,
  FRIEND_RELATION_OPTIONS,
  REFERENCE_TYPES,
} from "@/lib/constants/verification";
import {
  submitReferenceVerification,
  verifyReferenceOtp,
  resendReferenceOtp,
  getVerificationOverview,
} from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";
import type { ReferenceVerificationType } from "@/types";
import type { StringKey } from "@/lib/i18n";
import { Phone, ShieldCheck } from "lucide-react";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type Step = "type" | "details" | "otp" | "done";

const selectClass =
  "mt-1 flex h-12 w-full rounded-full border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function ReferenceVerificationPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [step, setStep] = useState<Step>("type");
  const [refType, setRefType] = useState<ReferenceVerificationType>("friend");
  const [contactName, setContactName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [pendingCall, setPendingCall] = useState<{ name: string; phone: string; type: ReferenceVerificationType } | null>(null);

  const relationOptions = useMemo(
    () => (refType === "friend" ? FRIEND_RELATION_OPTIONS : FAMILY_RELATION_OPTIONS),
    [refType]
  );

  useEffect(() => {
    if (relation && !relationOptions.some((o) => o.value === relation)) {
      setRelation("");
    }
  }, [refType, relation, relationOptions]);

  useEffect(() => {
    getVerificationOverview().then((overview) => {
      if (overview.verification.family_verified) {
        setAlreadyVerified(true);
        return;
      }
      const req = overview.referenceRequest;
      if (!req) return;
      if (req.status === "pending_otp") {
        setRequestId(req.id);
        setRefType(req.reference_type);
        setContactName(req.contact_name);
        setRelation(req.relation);
        setPhone(req.phone);
        setStep("otp");
      } else if (req.status === "pending_team_call" || req.status === "otp_verified") {
        setPendingCall({ name: req.contact_name, phone: req.phone, type: req.reference_type });
        setStep("done");
      } else if (req.status === "pending_review") {
        setStep("done");
      }
    });
  }, []);

  const handleSubmitDetails = async () => {
    if (!contactName.trim() || !relation || phone.replace(/\D/g, "").length < 10) {
      setError(t("ref_details_required"));
      return;
    }
    setSaving(true);
    setError("");
    const relationLabel = t(relationOptions.find((o) => o.value === relation)?.key as StringKey) || relation;
    const result = await submitReferenceVerification({
      reference_type: refType,
      contact_name: contactName.trim(),
      relation: relationLabel,
      phone,
    });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    if (result.request) setRequestId(result.request.id);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (!requestId || otp.length !== OTP_LENGTH) {
      setError(t("otp_invalid"));
      return;
    }
    setSaving(true);
    setError("");
    const result = await verifyReferenceOtp({ request_id: requestId, otp });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("otp_invalid"));
      return;
    }
    setPendingCall({ name: contactName, phone, type: refType });
    setStep("done");
  };

  const handleResend = async () => {
    if (!requestId) return;
    setSaving(true);
    await resendReferenceOtp(requestId);
    setSaving(false);
  };

  if (!hydrated) return null;

  if (alreadyVerified) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/trust-center" title={t("verify_reference")} />
        <div className="mx-4 mt-12 rounded-2xl border border-success/20 bg-success/10 px-6 py-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-success" />
          <p className="mt-4 font-semibold text-success">{t("verify_reference_done")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/trust-center" title={t("verify_reference")} />

      {step === "type" && (
        <div className="space-y-4 px-4 py-4">
          <p className="text-sm text-muted-foreground">{t("verify_reference_desc")}</p>
          <div className="space-y-3">
            {REFERENCE_TYPES.map((opt) => (
              <SelectPillRow
                key={opt.value}
                selected={refType === opt.value}
                onClick={() => setRefType(opt.value)}
                label={t(opt.key as StringKey)}
                description={t(opt.descKey as StringKey)}
              />
            ))}
          </div>
          <Button onClick={() => setStep("details")} className="w-full" size="lg">
            {t("continue")}
          </Button>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-4 px-4 py-4 pb-8">
          <p className="text-sm text-muted-foreground">
            {refType === "friend" ? t("ref_friend_form_desc") : t("ref_family_form_desc")}
          </p>
          <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)] space-y-4">
          <div>
            <label className="text-sm font-medium">{t("ref_contact_name")}</label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1" placeholder={t("ref_name_ph")} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("ref_relation")}</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className={selectClass}
            >
              <option value="">{t("select")}</option>
              {relationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.key as StringKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("ref_phone")}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1" placeholder="9876543210" />
          </div>
          <div className="rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
            {refType === "friend" ? t("ref_friend_flow_note") : t("ref_family_flow_note")}
          </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmitDetails} loading={saving} className="w-full" size="lg">
            {t("send_otp_to_reference")}
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4 px-4 py-4 pb-8">
          <div className="rounded-2xl border border-border/50 bg-white p-4 text-sm shadow-[var(--shadow-soft)]">
            <Phone className="mb-2 h-5 w-5 text-primary" />
            <p>{t("ref_otp_sent_desc")}</p>
            <p className="mt-2 font-medium">{contactName} · {phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium">{t("enter_reference_otp")}</label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
              inputMode="numeric"
              className="mt-1 rounded-full text-center text-lg tracking-widest"
              placeholder={"0".repeat(OTP_LENGTH)}
            />
          </div>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <Button onClick={handleVerifyOtp} loading={saving} className="w-full" size="lg">
            {t("verify_otp")}
          </Button>
          <Button variant="ghost" onClick={handleResend} disabled={saving} className="w-full text-sm">
            {t("resend_otp")}
          </Button>
        </div>
      )}

      {step === "done" && pendingCall && (
        <div className="mx-4 mt-8 space-y-4 rounded-2xl border border-border/50 bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-lg font-semibold">{t("ref_otp_verified_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {(pendingCall.type === "friend" ? t("ref_team_call_friend") : t("ref_team_call_family"))
              .replace("{name}", pendingCall.name)
              .replace("{phone}", pendingCall.phone)}
          </p>
          <p className="text-xs text-muted-foreground">{t("ref_team_call_timeline")}</p>
          <Button onClick={() => router.push("/trust-center")} className="w-full">
            {t("back_to_trust_center")}
          </Button>
        </div>
      )}
    </div>
  );
}
