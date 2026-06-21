"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
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

const WEB_OTP_WAIT_MS = 90_000;

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

  useEffect(() => {
    const stored = sessionStorage.getItem("saathini_phone");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setPhone(stored);
  }, [router]);

  const handleVerify = useCallback(
    async (codeOverride?: string) => {
      const otpCode = (codeOverride ?? code).replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (otpCode.length !== OTP_LENGTH || loading || !phone) return;
      setLoading(true);
      setError("");
      try {
        await verifyPhoneOtp(phone, otpCode);
        sessionStorage.removeItem("saathini_otp_sent");
        router.push("/onboarding/intent");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("invalid_code"));
      } finally {
        setLoading(false);
      }
    },
    [code, loading, phone, router, t]
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

  const { resetHandled, handleAutofillInput, handlePaste } = useOtpAutofill({
    onCode: applyCode,
  });

  /**
   * web.dev / PolicyBazaar: call credentials.get() FIRST (sync), then send SMS.
   * SMS must arrive AFTER get() starts — old SMS is never picked up.
   */
  useEffect(() => {
    if (!phone) return;

    let cancelled = false;
    const abort = new AbortController();
    const timeoutId = window.setTimeout(() => abort.abort(), WEB_OTP_WAIT_MS);

    resetHandled();

    const canWebOtp = supportsWebOtpApi() && isWebOtpOriginMatch();
    if (canWebOtp) {
      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: abort.signal,
        } as CredentialRequestOptions)
        .then((credential) => {
          if (cancelled || !credential || !("code" in credential)) return;
          const parsed = extractOtpCode(String((credential as OTPCredential).code));
          if (parsed) applyCode(parsed);
        })
        .catch(() => {
          /* timeout, dismissed, or mismatch */
        });
    }

    const alreadySent = sessionStorage.getItem("saathini_otp_sent") === phone;
    if (alreadySent) {
      setNeedsResend(true);
      inputRef.current?.focus();
      return () => {
        cancelled = true;
        abort.abort();
        window.clearTimeout(timeoutId);
      };
    }

    setNeedsResend(false);

    setSending(true);
    sendPhoneOtp(phone, "web")
      .then(({ phone: e164 }) => {
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

    return () => {
      cancelled = true;
      abort.abort();
      window.clearTimeout(timeoutId);
    };
  }, [phone, sessionKey, applyCode, resetHandled, t]);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    setError("");
    if (digits.length === OTP_LENGTH) {
      handleAutofillInput(digits);
      void handleVerify(digits);
    }
  };

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

  if (!hydrated) return null;

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
        id="otp-form"
        className="mx-auto w-full max-w-xs"
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
        <input
          ref={inputRef}
          id="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name="one-time-code"
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          disabled={sending}
          placeholder="Enter OTP"
          className="ui-otp-box ui-otp-single w-full text-center text-2xl font-bold sm:h-[4.25rem]"
          aria-label="One-time verification code"
        />
      </form>

      {error && (
        <p className="mt-4 text-center text-sm font-semibold text-destructive lg:text-left">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
        {webOtpReady
          ? "SMS aate hi Chrome popup aayega — Allow dabayein. Keyboard par OTP chip bhi aa sakti hai."
          : "Chrome Android + www.saathini.com par auto-fill best kaam karta hai."}{" "}
        Expires in {OTP_TTL_MINUTES} min.
      </p>
    </AuthScreenLayout>
  );
}
