"use client";

import { useEffect, useRef } from "react";
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

/** Web OTP autofill via SMS (Chrome Android) + keyboard one-time-code suggestions. */
export function useOtpAutofill({ enabled = true, listenKey = 0, onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    handledRef.current = false;
  }, [enabled, listenKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("OTPCredential" in window)) return;

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
      .catch(() => {
        /* User dismissed, unsupported, or origin/SMS mismatch */
      });

    return () => controller.abort();
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
    handleAutofillInput,
    handlePaste,
  };
}
