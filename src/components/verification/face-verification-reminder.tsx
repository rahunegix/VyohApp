"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScanFace, X } from "lucide-react";
import { getVerificationOverview } from "@/services/verification";
import { useTranslation } from "@/hooks/use-translation";

const DISMISS_KEY = "face_verify_reminder_dismissed_at";
const REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function shouldShowReminder(): boolean {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(DISMISS_KEY);
  if (!raw) return true;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return true;
  return Date.now() - dismissedAt > REMINDER_COOLDOWN_MS;
}

function dismissReminder() {
  sessionStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function maybeShowBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, tag: "face-verification-reminder" });
    return;
  }
  if (Notification.permission === "default") {
    void Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification(title, { body, tag: "face-verification-reminder" });
      }
    });
  }
}

export function FaceVerificationReminder() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [interestLimit, setInterestLimit] = useState(false);

  useEffect(() => {
    if (!shouldShowReminder()) return;

    const timer = window.setTimeout(() => {
      void getVerificationOverview().then((overview) => {
        if (overview.verification.face_verified) return;
        setVisible(true);
        maybeShowBrowserNotification(
          t("face_reminder_title"),
          t("face_reminder_body")
        );
      });
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [t]);

  useEffect(() => {
    const onInterestBlocked = () => {
      setInterestLimit(true);
      setVisible(true);
    };
    window.addEventListener("face-verification-required", onInterestBlocked);
    return () => window.removeEventListener("face-verification-required", onInterestBlocked);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    dismissReminder();
    setVisible(false);
  };

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom-4 rounded-2xl border border-primary/20 bg-white p-4 shadow-[var(--shadow-card)] lg:bottom-6 lg:left-auto lg:right-6"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
          <ScanFace className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{t("face_reminder_title")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {interestLimit ? t("face_limit_body") : t("face_reminder_body")}
          </p>
          <Link
            href="/trust-center/verify/face"
            className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
          >
            {t("face_verify_now")}
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-[6px] p-1 text-muted-foreground hover:bg-muted"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
