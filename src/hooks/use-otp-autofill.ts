"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractOtpCode,
  isWebOtpOriginMatch,
  supportsWebOtpApi,
} from "@/lib/auth/otp-autofill";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type Options = {
  enabled?: boolean;
  listenKey?: number;
  onCode: (code: string) => void;
};

export type WebOtpRequestResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "origin" | "denied" | "timeout" | "empty" };

function normalizeWebOtpCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmed)) return trimmed;
  return extractOtpCode(trimmed);
}

/** Web OTP autofill via SMS (Chrome Android) + keyboard one-time-code suggestions. */
export function useOtpAutofill({ enabled = true, listenKey = 0, onCode }: Options) {
  const handledRef = useRef(false);
  const onCodeRef = useRef(onCode);
  const abortRef = useRef<AbortController | null>(null);
  const [visibilityRetry, setVisibilityRetry] = useState(0);
  onCodeRef.current = onCode;

  useEffect(() => {
    handledRef.current = false;
    setVisibilityRetry(0);
  }, [enabled, listenKey]);

  const applyCredential = useCallback((raw: string) => {
    const code = normalizeWebOtpCode(raw);
    if (!code || handledRef.current) return false;
    handledRef.current = true;
    onCodeRef.current(code);
    return true;
  }, []);

  const listenForSmsOtp = useCallback(() => {
    if (!enabled || !supportsWebOtpApi() || !isWebOtpOriginMatch()) return undefined;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        if (!credential || !("code" in credential)) return;
        applyCredential(String((credential as OTPCredential).code));
      })
      .catch(() => {
        /* Aborted, dismissed, SMS mismatch, or SMS not yet received */
      });

    return () => {
      controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [applyCredential, enabled]);

  /** User-gesture trigger — tap after SMS arrives (most reliable on Chrome Android). */
  const requestWebOtp = useCallback(async (): Promise<WebOtpRequestResult> => {
    if (!supportsWebOtpApi()) return { ok: false, reason: "unsupported" };
    if (!isWebOtpOriginMatch()) return { ok: false, reason: "origin" };
    if (handledRef.current) return { ok: true };

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const credential = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions);

      if (!credential || !("code" in credential)) {
        return { ok: false, reason: "empty" };
      }

      if (applyCredential(String((credential as OTPCredential).code))) {
        return { ok: true };
      }
      return { ok: false, reason: "empty" };
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") return { ok: false, reason: "denied" };
        if (err.name === "AbortError") return { ok: false, reason: "timeout" };
      }
      return { ok: false, reason: "empty" };
    }
  }, [applyCredential]);

  useEffect(() => {
    const cleanup = listenForSmsOtp();
    return () => cleanup?.();
  }, [listenForSmsOtp, listenKey, visibilityRetry]);

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
    applyCredential(value);
  };

  const handlePaste = (text: string) => {
    if (handledRef.current) return false;
    const code = extractOtpCode(text);
    if (!code) return false;
    handledRef.current = true;
    onCodeRef.current(code);
    return true;
  };

  const pasteFromClipboard = async (): Promise<boolean> => {
    if (handledRef.current || typeof navigator === "undefined" || !navigator.clipboard?.readText) {
      return false;
    }
    try {
      const text = await navigator.clipboard.readText();
      return handlePaste(text);
    } catch {
      return false;
    }
  };

  return {
    otpLength: OTP_LENGTH,
    webOtpSupported: supportsWebOtpApi(),
    originMatches: isWebOtpOriginMatch(),
    requestWebOtp,
    pasteFromClipboard,
    handleAutofillInput,
    handlePaste,
  };
}
