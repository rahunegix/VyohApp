"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { cn } from "@/lib/helpers/utils";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
import { codeToDigitArray } from "@/lib/auth/otp-autofill";
import { OTP_LENGTH, OTP_TTL_MINUTES } from "@/lib/auth/otp-config";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { useOtpAutofill } from "@/hooks/use-otp-autofill";

const EMPTY_OTP = Array.from({ length: OTP_LENGTH }, () => "");

export default function OtpPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [listenKey, setListenKey] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autofillRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
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
    (code: string) => {
      setOtp(codeToDigitArray(code));
      setFocusedIndex(lastIndex);
      void handleVerify(code);
    },
    [handleVerify, lastIndex]
  );

  const { handleAutofillInput, handlePaste } = useOtpAutofill({
    enabled: true,
    listenKey,
    onCode: applyCode,
  });

  useEffect(() => {
    autofillRef.current?.focus();
  }, [listenKey]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < lastIndex) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    if (newOtp.join("").length === OTP_LENGTH) {
      void handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < lastIndex) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleContainerPaste = (e: React.ClipboardEvent) => {
    if (handlePaste(e.clipboardData.getData("text"))) {
      e.preventDefault();
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    setError("");
    setOtp(EMPTY_OTP);
    setListenKey((k) => k + 1);
    inputRefs.current[0]?.focus();
    autofillRef.current?.focus();
    setFocusedIndex(0);
    try {
      await sendPhoneOtp(phone, "web");
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
          We sent a code to{" "}
          <span className="font-bold text-primary">+91 {phone || "••••••••••"}</span>. Enter it
          here to join {APP_NAME}.
        </>
      }
      footer={
        <>
          <Button
            onClick={() => handleVerify()}
            loading={loading}
            disabled={!isComplete}
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
              disabled={resending}
              className="font-bold text-primary hover:text-primary/80 disabled:opacity-50"
            >
              {resending ? t("sending") : t("resend")}
            </button>
          </p>
        </>
      }
    >
      <form
        ref={formRef}
        id="otp-form"
        className="mx-auto max-w-[280px]"
        onSubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        {/* Primary field for Web OTP + iOS/Android keyboard autofill */}
        <input
          ref={autofillRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name="one-time-code"
          maxLength={OTP_LENGTH}
          value={otp.join("")}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
            setOtp(codeToDigitArray(digits));
            if (digits.length === OTP_LENGTH) {
              handleAutofillInput(digits);
            }
          }}
          className="sr-only"
          aria-label="One-time verification code"
        />

        <div className="flex justify-center gap-3 lg:justify-start" onPaste={handleContainerPaste}>
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
                autoComplete="off"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => {
                  setFocusedIndex(i);
                  autofillRef.current?.focus();
                }}
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

      <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
        Code expires in {OTP_TTL_MINUTES} minutes. Use Chrome on your phone at{" "}
        <span className="font-medium">www.saathini.com</span> for SMS auto-fill.
      </p>
    </AuthScreenLayout>
  );
}
