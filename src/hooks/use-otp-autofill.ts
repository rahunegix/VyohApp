"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractOtpCode } from "@/lib/auth/otp-autofill";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type Options = {
  enabled?: boolean;
  /** Bump after resend to re-listen for the next SMS. */
  listenKey?: number;
  onCode: (code: string) => void;
};

function normalizeWebOtpCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmed)) return trimmed;
  return extractOtpCode(trimmed);
}

function supportsWebOtp() {
  return typeof window !== "undefined" && "OTPCredential" in window;
}

/** Web OTP autofill via SMS (Chrome Android) + keyboard one-time-code suggestions. */
export function useOtpAutofill({ enabled = true, listenKey = 0, onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  const [visibilityRetry, setVisibilityRetry] = useState(0);
  onCodeRef.current = onCode;

  useEffect(() => {
    handledRef.current = false;
    setVisibilityRetry(0);
  }, [enabled, listenKey]);

  const listenForSmsOtp = useCallback(() => {
    if (!enabled || !supportsWebOtp()) return undefined;

    const controller = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        if (handledRef.current) return;
        if (!credential || !("code" in credential)) return;

        const code = normalizeWebOtpCode(String((credential as OTPCredential).code));
        if (code) {
          handledRef.current = true;
          onCodeRef.current(code);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development" && err instanceof Error && err.name !== "AbortError") {
          console.debug("[WebOTP]", err.message);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  useEffect(() => {
    const cleanup = listenForSmsOtp();
    return () => cleanup?.();
  }, [listenForSmsOtp, listenKey, visibilityRetry]);

  // Re-arm when user returns from the SMS app (Chrome Android).
  useEffect(() => {
    if (!enabled || !supportsWebOtp()) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible" || handledRef.current) return;
      setVisibilityRetry((n) => n + 1);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, listenKey]);

  const handleAutofillInput = (value: string) => {
    if (handledRef.current) return;
    const code = normalizeWebOtpCode(value);
    if (code) {
      handledRef.current = true;
      onCodeRef.current(code);
    }
  };

  const handlePaste = (text: string) => {
    if (handledRef.current) return false;
    const code = extractOtpCode(text);
    if (!code) return false;
    handledRef.current = true;
    onCodeRef.current(code);
    return true;
  };

  return {
    otpLength: OTP_LENGTH,
    webOtpSupported: supportsWebOtp(),
    handleAutofillInput,
    handlePaste,
  };
}
