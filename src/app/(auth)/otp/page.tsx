"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
import { OTP_LENGTH, OTP_TTL_MINUTES } from "@/lib/auth/otp-config";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { useOtpAutofill } from "@/hooks/use-otp-autofill";

export default function OtpPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [listenKey, setListenKey] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendStartedRef = useRef(false);

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

  const { handleAutofillInput, handlePaste } = useOtpAutofill({
    enabled: Boolean(phone),
    listenKey,
    onCode: applyCode,
  });

  // Start Web OTP listener first, then send SMS from this page (critical for Chrome popup).
  useEffect(() => {
    if (!phone || sendStartedRef.current) return;
    sendStartedRef.current = true;

    const alreadySent = sessionStorage.getItem("saathini_otp_sent") === phone;
    if (alreadySent) {
      inputRef.current?.focus();
      return;
    }

    setSending(true);
    sendPhoneOtp(phone, "web")
      .then(({ phone: e164 }) => {
        sessionStorage.setItem("saathini_phone_e164", e164);
        sessionStorage.setItem("saathini_otp_sent", phone);
      })
      .catch((err) => {
        sendStartedRef.current = false;
        setError(err instanceof Error ? err.message : t("otp_failed"));
      })
      .finally(() => {
        setSending(false);
        inputRef.current?.focus();
      });
  }, [phone, t]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [listenKey]);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    setError("");
    if (digits.length === OTP_LENGTH) {
      handleAutofillInput(digits);
      void handleVerify(digits);
    }
  };

  const handleResend = async () => {
    if (!phone || resending) return;
    setResending(true);
    setError("");
    setCode("");
    setListenKey((k) => k + 1);
    try {
      await sendPhoneOtp(phone, "web");
      sessionStorage.setItem("saathini_otp_sent", phone);
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resend_failed"));
    } finally {
      setResending(false);
    }
  };

  const isComplete = code.length === OTP_LENGTH;

  if (!hydrated) return null;

  return (
    <AuthScreenLayout
      title="Verify it's you"
      subtitle={
        <>
          {sending ? (
            <>Sending code to{" "}</>
          ) : (
            <>We sent a code to{" "}</>
          )}
          <span className="font-bold text-primary">+91 {phone || "••••••••••"}</span>. Enter it
          here to join {APP_NAME}.
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
              disabled={resending || sending}
              className="font-bold text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {resending ? t("sending") : t("resend")}
            </button>
          </p>
        </>
      }
    >
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
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name="one-time-code"
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          disabled={sending}
          placeholder="• • • •"
          className="ui-otp-box ui-otp-single w-full text-center text-2xl font-bold tracking-[0.55em] sm:h-[4.25rem]"
          aria-label="One-time verification code"
        />
      </form>

      {error && (
        <p className="mt-4 text-center text-sm font-semibold text-destructive lg:text-left">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
        Code expires in {OTP_TTL_MINUTES} minutes. On your phone, open{" "}
        <span className="font-medium">Chrome → www.saathini.com</span> and stay on this screen
        when the SMS arrives.
      </p>
    </AuthScreenLayout>
  );
}
