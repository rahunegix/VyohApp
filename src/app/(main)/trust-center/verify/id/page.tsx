"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ID_DOCUMENT_OPTIONS } from "@/lib/constants/verification";
import { submitIdVerification, getVerificationOverview } from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";
import type { StringKey } from "@/lib/i18n";
import type { IdDocumentType } from "@/types";
import { IdCard, Upload, ShieldCheck } from "lucide-react";

const selectClass =
  "mt-1 flex h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function IdVerificationPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [docType, setDocType] = useState<IdDocumentType>("aadhaar");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getVerificationOverview().then((overview) => {
      if (overview.verification.id_verified) setAlreadyVerified(true);
      else if (overview.idRequest?.status === "pending_review") setPending(true);
      else if (overview.idRequest?.status === "rejected") setError(overview.idRequest.rejection_reason ?? t("verify_id_rejected"));
    });
  }, [t]);

  const handleSubmit = async () => {
    if (!frontFile) {
      setError(t("id_front_required"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const frontUrl = await fileToDataUrl(frontFile);
      const backUrl = backFile ? await fileToDataUrl(backFile) : undefined;
      const result = await submitIdVerification({
        document_type: docType,
        document_front_url: frontUrl,
        document_back_url: backUrl,
      });
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t("profile_save_error"));
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) return null;

  if (alreadyVerified) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/trust-center" title={t("verify_id")} />
        <div className="mx-4 mt-12 rounded-2xl border border-success/20 bg-success/10 px-6 py-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-success" />
          <p className="mt-4 font-semibold text-success">{t("verify_id_done")}</p>
        </div>
      </div>
    );
  }

  if (pending || submitted) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/trust-center" title={t("verify_id")} />
        <div className="mx-4 mt-8 space-y-4 rounded-2xl border border-border/50 bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)]">
          <IdCard className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-lg font-bold">{t("verify_id_submitted_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("verify_id_submitted_desc")}</p>
          <Button onClick={() => router.push("/trust-center")} className="mt-2 w-full">
            {t("back_to_trust_center")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/trust-center" title={t("verify_id")} subtitle={t("verify_id_desc")} />
      <div className="space-y-5 px-4 py-4 pb-8">

        <div>
          <label className="text-sm font-medium">{t("id_document_type")}</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as IdDocumentType)}
            className={selectClass}
          >
            {ID_DOCUMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.key as StringKey)}
              </option>
            ))}
          </select>
        </div>

        <UploadField
          label={t("id_front_photo")}
          hint={t("id_upload_hint")}
          file={frontFile}
          onChange={setFrontFile}
        />
        <UploadField
          label={t("id_back_photo")}
          hint={t("id_back_optional")}
          file={backFile}
          onChange={setBackFile}
          optional
        />

        <div className="rounded-2xl border border-border/50 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground space-y-1">
          <p>• {t("id_privacy_1")}</p>
          <p>• {t("id_privacy_2")}</p>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button onClick={handleSubmit} loading={saving} className="w-full" size="lg">
          {t("submit_for_review")}
        </Button>
      </div>
    </div>
  );
}

function UploadField({
  label,
  hint,
  file,
  onChange,
  optional,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {optional && <span className="text-muted-foreground font-normal"> ({hint})</span>}
      </label>
      <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-8 transition-colors hover:border-primary hover:bg-primary/10">
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-center">
          {file ? file.name : hint}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
