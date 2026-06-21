"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { cn } from "@/lib/helpers/utils";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
import { codeToDigitArray } from "@/lib/auth/otp-autofill";
import { OTP_LENGTH, OTP_TTL_MINUTES } from "@/lib/auth/otp-config";
import { getExpectedClientWebOtpOrigin, isWebOtpOriginMatch } from "@/lib/auth/otp-autofill";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { useOtpAutofill } from "@/hooks/use-otp-autofill";

const EMPTY_OTP = Array.from({ length: OTP_LENGTH }, () => "");

export default function OtpPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [listenKey, setListenKey] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autofillRef = useRef<HTMLInputElement | null>(null);
  const sendStartedRef = useRef(false);
  const lastIndex = OTP_LENGTH - 1;

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
      const code = codeOverride ?? otp.join("");
      if (code.length !== OTP_LENGTH || loading || !phone) return;
      setLoading(true);
      setError("");
      try {
        await verifyPhoneOtp(phone, code);
        sessionStorage.removeItem("saathini_otp_sent");
        router.push("/onboarding/intent");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("invalid_code"));
      } finally {
        setLoading(false);
      }
    },
    [loading, otp, phone, router, t]
  );

  const applyCode = useCallback(
    (incoming: string) => {
      setOtp(codeToDigitArray(incoming));
      setFocusedIndex(lastIndex);
      void handleVerify(incoming);
    },
    [handleVerify, lastIndex]
  );

  const { handleAutofillInput, handlePaste } = useOtpAutofill({
    enabled: Boolean(phone),
    listenKey,
    onCode: applyCode,
  });

  // Listener first, then SMS (PolicyBazaar / web.dev order).
  useEffect(() => {
    if (!phone || sendStartedRef.current) return;
    sendStartedRef.current = true;

    const alreadySent = sessionStorage.getItem("saathini_otp_sent") === phone;
    if (alreadySent) {
      autofillRef.current?.focus();
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
        autofillRef.current?.focus();
        inputRefs.current[0]?.focus();
      });
  }, [phone, t]);

  useEffect(() => {
    if (document.visibilityState !== "visible") return;
    autofillRef.current?.focus();
  }, [listenKey]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < lastIndex) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    const code = next.join("");
    if (code.length === OTP_LENGTH) {
      void handleVerify(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleResend = async () => {
    if (!phone || resending) return;
    setResending(true);
    setError("");
    setOtp(EMPTY_OTP);
    setListenKey((k) => k + 1);
    setFocusedIndex(0);
    try {
      await sendPhoneOtp(phone, "web");
      sessionStorage.setItem("saathini_otp_sent", phone);
      autofillRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resend_failed"));
    } finally {
      setResending(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

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
              disabled={resending || sending}
              className="font-bold text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {resending ? t("sending") : t("resend")}
            </button>
          </p>
        </>
      }
    >
      {!isWebOtpOriginMatch() && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          OTP auto-fill ke liye{" "}
          <span className="font-semibold">{getExpectedClientWebOtpOrigin()}</span> use karein.
        </p>
      )}

      <form
        id="otp-form"
        className="mx-auto max-w-[280px]"
        onSubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        {/* Hidden field: keyboard OTP suggestion (iOS + Android Gboard) */}
        <input
          ref={autofillRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name="one-time-code"
          maxLength={OTP_LENGTH}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-px w-px opacity-0"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
            if (digits.length === OTP_LENGTH) {
              handleAutofillInput(digits);
            }
            e.target.value = "";
          }}
        />

        <div
          className="flex justify-center gap-3"
          onPaste={(e) => {
            if (handlePaste(e.clipboardData.getData("text"))) {
              e.preventDefault();
            }
          }}
        >
          {otp.map((digit, i) => {
            const filled = digit !== "";
            const focused = focusedIndex === i;
            return (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => setFocusedIndex(i)}
                disabled={sending}
                className={cn(
                  "ui-otp-box sm:h-[4.25rem] sm:w-[3.5rem]",
                  filled && "ui-otp-box-filled",
                  !filled && focused && "border-primary bg-primary/5"
                )}
              />
            );
          })}
        </div>
      </form>

      {error && (
        <p className="mt-4 text-center text-sm font-semibold text-destructive lg:text-left">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
        SMS aane par keyboard par OTP suggestion dikhe to tap karein. Chrome Android par site par
        raho — popup khud aayega. Code expires in {OTP_TTL_MINUTES} min.
      </p>
    </AuthScreenLayout>
  );
}
