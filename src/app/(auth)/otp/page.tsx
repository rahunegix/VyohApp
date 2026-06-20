"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquareText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { cn } from "@/lib/helpers/utils";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phone";
import { useTranslation } from "@/hooks/use-translation";

export default function OtpPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("saathini_phone");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setPhone(stored);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
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
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white lg:overflow-y-auto">
      <div className="flex flex-1 flex-col px-6 pb-10 pt-6 safe-top lg:justify-center lg:px-10 lg:py-12">
        <AuthBackButton className="mb-6 lg:mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
        >
          <MessageSquareText className="h-7 w-7 text-primary" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{t("verify_otp")}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {t("sent_to")}{" "}
            <strong className="text-foreground">+91 {phone || "••••••••••"}</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-1 flex-col lg:mt-10 lg:flex-none"
        >
          <label className="mb-4 ml-1 block text-center text-xs font-bold uppercase tracking-wider text-foreground lg:text-left">
            {t("enter_code")}
          </label>

          <div className="flex justify-center gap-2 sm:gap-3 lg:justify-start">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={cn(
                  "h-14 w-12 rounded-[1rem] border-2 text-center text-2xl font-extrabold shadow-sm transition-all duration-200 focus:outline-none focus:scale-105 sm:h-16 sm:w-14",
                  digit
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/60 bg-white focus:border-primary focus:bg-primary/5"
                )}
              />
            ))}
          </div>

          <div className="mt-4 min-h-[24px]">
            {error && (
              <p className="text-center text-sm font-semibold text-destructive lg:text-left">{error}</p>
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4 lg:max-w-md">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              OTP expires in 10 minutes. Never share this code with anyone claiming to be from {t("welcome_saathini")}.
            </p>
          </div>

          <div className="mt-auto space-y-5 pt-8 lg:mt-10 lg:pt-0">
            <Button
              onClick={handleVerify}
              loading={loading}
              disabled={!isComplete}
              className="h-14 w-full rounded-2xl text-[17px] font-bold shadow-lg"
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

            {process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === "true" && (
              <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-3 text-center text-xs font-medium text-amber-800">
                {t("dev_otp_hint")} <strong className="font-bold">123456</strong>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
