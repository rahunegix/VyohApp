"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { OtpInput } from "@/components/auth/otp-input";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
import { getPostAuthPath } from "@/lib/auth/profile";
import { redirectAfterAuth } from "@/lib/auth/redirect-after-auth";
import {
  extractOtpCode,
  getClientWebOtpOrigin,
  getExpectedClientWebOtpOrigin,
  isWebOtpOriginMatch,
  supportsWebOtpApi,
} from "@/lib/auth/otp-autofill";
import { OTP_LENGTH, OTP_TTL_MINUTES } from "@/lib/auth/otp-config";
import { useTranslation } from "@/hooks/use-translation";
import { useOtpAutofill } from "@/hooks/use-otp-autofill";
import { withProgress, hideProgress } from "@/lib/progress";
import { PageSkeleton } from "@/components/common/page-skeleton";

const WEB_OTP_WAIT_MS = 90_000;
/** SMS must arrive after credentials.get() — small delay avoids race with the API call. */
const SMS_SEND_DELAY_MS = 600;

export default function OtpPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const [needsResend, setNeedsResend] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const webOtpAbortRef = useRef<AbortController | null>(null);
  const applyCodeRef = useRef<(code: string) => void>(() => {});
  const webOtpSessionRef = useRef(0);
  const verifyInFlightRef = useRef(false);

  const startWebOtpListener = useCallback(() => {
    if (!phone || !supportsWebOtpApi() || !isWebOtpOriginMatch()) return;

    webOtpAbortRef.current?.abort();
    const session = ++webOtpSessionRef.current;
    const ac = new AbortController();
    webOtpAbortRef.current = ac;
    const timeoutId = window.setTimeout(() => ac.abort(), WEB_OTP_WAIT_MS);

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        if (session !== webOtpSessionRef.current) return;
        if (!credential || !("code" in credential)) return;
        const parsed = extractOtpCode(String((credential as OTPCredential).code));
        if (parsed && inputRef.current) {
          inputRef.current.value = parsed;
          applyCodeRef.current(parsed);
        }
      })
      .catch(() => {
        /* timeout, dismissed, or SMS mismatch */
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  }, [phone]);

  useEffect(() => {
    const stored = sessionStorage.getItem("saathini_phone");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setPhone(stored);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success || !json.data?.profile) return;
        redirectAfterAuth(getPostAuthPath(json.data.profile as Record<string, unknown>));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerify = useCallback(
    async (codeOverride?: string) => {
      const otpCode = (codeOverride ?? code).replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (otpCode.length !== OTP_LENGTH || loading || !phone || verifyInFlightRef.current) return;
      verifyInFlightRef.current = true;
      setLoading(true);
      setError("");
      try {
        const result = await withProgress("Verifying…", () => verifyPhoneOtp(phone, otpCode));
        sessionStorage.removeItem("saathini_otp_sent");
        redirectAfterAuth(getPostAuthPath(result?.profile as Record<string, unknown> | undefined));
      } catch (err) {
        verifyInFlightRef.current = false;
        setError(err instanceof Error ? err.message : t("invalid_code"));
        setLoading(false);
      }
    },
    [code, loading, phone, t]
  );

  const applyCode = useCallback(
    (incoming: string) => {
      const digits = incoming.replace(/\D/g, "").slice(0, OTP_LENGTH);
      setCode(digits);
      if (digits.length === OTP_LENGTH) {
        void handleVerify(digits);
      }
    },
    [handleVerify]
  );

  applyCodeRef.current = applyCode;

  const { resetHandled, handleAutofillInput, handlePaste } = useOtpAutofill({
    onCode: applyCode,
  });

  /** Chrome WebOTP: listener before SMS; restart on resend via sessionKey. */
  useEffect(() => {
    startWebOtpListener();
    return () => {
      webOtpAbortRef.current?.abort();
    };
  }, [phone, sessionKey, startWebOtpListener]);

  /** Abort WebOTP when user submits manually (Chrome docs). */
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onSubmit = () => webOtpAbortRef.current?.abort();
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  /** Start listener first, then send SMS — only when sessionKey changes. */
  useEffect(() => {
    if (!phone) return;

    let cancelled = false;
    resetHandled();

    const alreadySent = sessionStorage.getItem("saathini_otp_sent") === phone;
    if (alreadySent) {
      setNeedsResend(true);
      inputRef.current?.focus();
      return;
    }

    setNeedsResend(false);
    setSending(true);

    const sendTimer = window.setTimeout(() => {
      void withProgress(t("sending"), async () => {
        const { phone: e164 } = await sendPhoneOtp(phone, "web");
        if (cancelled) return;
        sessionStorage.setItem("saathini_phone_e164", e164);
        sessionStorage.setItem("saathini_otp_sent", phone);
      })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : t("otp_failed"));
        })
        .finally(() => {
          if (!cancelled) {
            setSending(false);
            inputRef.current?.focus();
          }
        });
    }, SMS_SEND_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(sendTimer);
      hideProgress();
    };
  }, [phone, sessionKey, resetHandled, t]);

  const handleResend = () => {
    if (!phone || sending) return;
    setError("");
    setCode("");
    sessionStorage.removeItem("saathini_otp_sent");
    setSessionKey((k) => k + 1);
  };

  const isComplete = code.length === OTP_LENGTH;
  const originOk = isWebOtpOriginMatch();
  const webOtpReady = supportsWebOtpApi() && originOk;

  if (!hydrated) return <PageSkeleton variant="auth" withHeader={false} className="min-h-dvh" />;

  return (
    <AuthScreenLayout
      title="Verify it's you"
      subtitle={
        <>
          {sending ? <>Sending code to{" "}</> : <>Enter the code sent to{" "}</>}
          <span className="font-bold text-primary">+91 {phone || "••••••••••"}</span>
        </>
      }
      footer={
        <>
          <Button
            onClick={() => handleVerify()}
            loading={loading}
            disabled={!isComplete || sending}
            size="lg"
            className="w-full"
          >
            {t("verify_continue")}
          </Button>
          <p className="text-center text-[15px] font-medium text-muted-foreground">
            {t("didnt_receive")}{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="font-bold text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {sending ? t("sending") : t("resend")}
            </button>
          </p>
        </>
      }
    >
      {!originOk && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Auto-fill ke liye{" "}
          <span className="font-semibold">{getExpectedClientWebOtpOrigin()}</span> par kholo (abhi:{" "}
          {getClientWebOtpOrigin() || "unknown"}).
        </p>
      )}

      {needsResend && (
        <p className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
          Auto-fill ke liye <span className="font-semibold">Resend</span> dabayein — purana SMS pick
          nahi hota.
        </p>
      )}

      <form
        ref={formRef}
        id="otp-form"
        className="mx-auto w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
        onPaste={(e) => {
          if (handlePaste(e.clipboardData.getData("text"))) {
            e.preventDefault();
          }
        }}
      >
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            setError("");
            if (next.length === OTP_LENGTH) {
              handleAutofillInput(next);
            }
          }}
          onComplete={(next) => void handleVerify(next)}
          onFocus={() => startWebOtpListener()}
          disabled={sending || loading}
          error={Boolean(error)}
          autofillRef={inputRef}
        />
      </form>

      {error && (
        <p className="mt-4 text-center text-sm font-semibold text-destructive lg:text-left">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
        {webOtpReady
          ? "SMS aate hi Chrome bottom sheet aayega — Verify dabayein. SATINI sender contacts mein ho to popup band ho jata hai."
          : "Chrome Android + www.saathini.com par best kaam karta hai."}{" "}
        Expires in {OTP_TTL_MINUTES} min.
      </p>
    </AuthScreenLayout>
  );
}
