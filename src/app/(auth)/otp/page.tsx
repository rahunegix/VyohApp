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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenAutofillRef = useRef<HTMLInputElement | null>(null);
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
      if (code.length !== OTP_LENGTH || loading) return;
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

  const { handleHiddenInput, handlePaste } = useOtpAutofill({
    enabled: Boolean(phone),
    onCode: applyCode,
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < lastIndex) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
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
    setResending(true);
    setError("");
    setOtp(EMPTY_OTP);
    inputRefs.current[0]?.focus();
    hiddenAutofillRef.current?.focus();
    setFocusedIndex(0);
    try {
      await sendPhoneOtp(phone);
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
      {/* Hidden field for iOS/Android SMS autofill + paste target */}
      <input
        ref={hiddenAutofillRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
        onChange={(e) => handleHiddenInput(e.target.value)}
      />

      <div
        className="flex justify-center gap-3 lg:justify-start"
        onPaste={handleContainerPaste}
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
              className={cn(
                "ui-otp-box sm:h-[4.25rem] sm:w-[3.5rem]",
                filled && "ui-otp-box-filled",
                !filled && focused && "border-primary bg-primary/5"
              )}
            />
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm font-semibold text-destructive lg:text-left">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground lg:text-left">
        Code expires in {OTP_TTL_MINUTES} minutes. Never share your OTP with anyone.
      </p>
    </AuthScreenLayout>
  );
}
