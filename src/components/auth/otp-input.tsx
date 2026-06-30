"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/helpers/utils";
import { OTP_LENGTH } from "@/lib/auth/otp-config";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  error?: boolean;
  /** Hidden input ref for Web OTP / SMS autofill */
  autofillRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
};

export function OtpInput({
  value,
  onChange,
  onComplete,
  onFocus,
  disabled,
  error,
  autofillRef,
  className,
}: OtpInputProps) {
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
  while (digits.length < OTP_LENGTH) digits.push("");

  const focusDigit = useCallback((index: number) => {
    const el = digitRefs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))];
    el?.focus();
    el?.select();
  }, []);

  const emit = useCallback(
    (next: string) => {
      const clean = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
      onChange(clean);
      if (clean.length === OTP_LENGTH) {
        onComplete?.(clean);
      }
    },
    [onChange, onComplete]
  );

  const handleDigitChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[index] = char;
    const next = arr.join("").replace(/\D/g, "").slice(0, OTP_LENGTH);
    emit(next);
    if (char && index < OTP_LENGTH - 1) {
      focusDigit(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const arr = [...digits];
        arr[index] = "";
        emit(arr.join(""));
      } else if (index > 0) {
        focusDigit(index - 1);
        const arr = [...digits];
        arr[index - 1] = "";
        emit(arr.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusDigit(index - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusDigit(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    emit(pasted);
    focusDigit(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  useEffect(() => {
    if (!disabled && value.length === 0) {
      focusDigit(0);
    }
  }, [disabled, value.length, focusDigit]);

  return (
    <div className={cn("relative", className)}>
      {/* Web OTP / SMS autofill hooks into this hidden field */}
      <input
        ref={autofillRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        name="one-time-code"
        value={value}
        onChange={(e) => {
          const clean = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
          emit(clean);
          if (clean.length > 0) {
            focusDigit(Math.min(clean.length, OTP_LENGTH - 1));
          }
        }}
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
        aria-hidden
      />

      <div
        className="flex items-center justify-center gap-2.5 sm:gap-3"
        onPaste={handlePaste}
        role="group"
        aria-label="One-time verification code"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              digitRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => {
              e.target.select();
              onFocus?.();
            }}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className={cn(
              "ui-otp-box h-14 w-12 text-xl font-extrabold tracking-tight sm:h-16 sm:w-14 sm:text-2xl",
              digit && "ui-otp-box-filled",
              error && "border-destructive focus:border-destructive",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
