"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractOtpCode,
  isWebOtpOriginMatch,
  supportsWebOtpApi,
} from "@/lib/auth/otp-autofill";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

/** Chrome waits until SMS arrives — abort so UI never hangs (web.dev pattern). */
const WEB_OTP_WAIT_MS = 90_000;

type Options = {
  enabled?: boolean;
  listenKey?: number;
  onCode: (code: string) => void;
};

function normalizeWebOtpCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmed)) return trimmed;
  return extractOtpCode(trimmed);
}

/**
 * PolicyBazaar / web.dev pattern:
 * - `autocomplete="one-time-code"` on the input (keyboard suggestion)
 * - Background `navigator.credentials.get()` on page load (Chrome Android popup)
 * - No manual button — credentials.get() hangs until SMS or timeout
 */
export function useOtpAutofill({ enabled = true, listenKey = 0, onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  const [visibilityRetry, setVisibilityRetry] = useState(0);
  onCodeRef.current = onCode;

  useEffect(() => {
    handledRef.current = false;
  }, [enabled, listenKey, visibilityRetry]);

  const applyCode = useCallback((raw: string) => {
    const code = normalizeWebOtpCode(raw);
    if (!code || handledRef.current) return false;
    handledRef.current = true;
    onCodeRef.current(code);
    return true;
  }, []);

  useEffect(() => {
    if (!enabled || !supportsWebOtpApi() || !isWebOtpOriginMatch()) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), WEB_OTP_WAIT_MS);

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        if (!credential || !("code" in credential)) return;
        applyCode(String((credential as OTPCredential).code));
      })
      .catch(() => {
        /* Aborted (timeout), dismissed, or SMS/domain mismatch */
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [applyCode, enabled, listenKey, visibilityRetry]);

  useEffect(() => {
    if (!enabled || !supportsWebOtpApi()) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible" || handledRef.current) return;
      setVisibilityRetry((n) => n + 1);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, listenKey]);

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
    webOtpSupported: supportsWebOtpApi(),
    originMatches: isWebOtpOriginMatch(),
    handleAutofillInput,
    handlePaste,
  };
}
