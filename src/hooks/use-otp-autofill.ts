"use client";

import { useEffect, useRef } from "react";
import { extractOtpCode } from "@/lib/auth/otp-autofill";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type Options = {
  enabled?: boolean;
  onCode: (code: string) => void;
};

/** Web OTP autofill via SMS (Chrome Android) + iOS/Android keyboard suggestions. */
export function useOtpAutofill({ enabled = true, onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    handledRef.current = false;
  }, [enabled]);

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
        const code =
          credential && "code" in credential
            ? extractOtpCode(String((credential as OTPCredential).code))
            : null;
        if (code) {
          handledRef.current = true;
          onCodeRef.current(code);
        }
      })
      .catch(() => {
        /* User dismissed or browser unsupported — ignore */
      });

    return () => controller.abort();
  }, [enabled]);

  const handleHiddenInput = (value: string) => {
    if (handledRef.current) return;
    const code = extractOtpCode(value);
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
    handleHiddenInput,
    handlePaste,
  };
}
