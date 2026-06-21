"use client";

import { useCallback, useEffect, useRef } from "react";
import { extractOtpCode } from "@/lib/auth/otp-autofill";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type Options = {
  onCode: (code: string) => void;
};

function normalizeWebOtpCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmed)) return trimmed;
  return extractOtpCode(trimmed);
}

/** Keyboard / paste OTP helpers (Web OTP runs in page effect for correct SMS timing). */
export function useOtpAutofill({ onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  const applyCode = useCallback((raw: string) => {
    const code = normalizeWebOtpCode(raw);
    if (!code || handledRef.current) return false;
    handledRef.current = true;
    onCodeRef.current(code);
    return true;
  }, []);

  const resetHandled = useCallback(() => {
    handledRef.current = false;
  }, []);

  const handleAutofillInput = (value: string) => {
    applyCode(value);
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
    resetHandled,
    handleAutofillInput,
    handlePaste,
  };
}
