"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { phoneSchema } from "@/lib/validation/schemas";
import { sendPhoneOtp } from "@/lib/auth/phone";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { cn } from "@/lib/helpers/utils";

type PhoneForm = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (data: PhoneForm) => {
    setLoading(true);
    setError("");
    try {
      const { phone } = await sendPhoneOtp(data.phone);
      sessionStorage.setItem("saathini_phone", data.phone);
      sessionStorage.setItem("saathini_phone_e164", phone);
      router.push("/otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("otp_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <AuthScreenLayout
      backHref="/onboarding/language"
      title={t("mobile_number")}
      subtitle={
        <>
          {t("otp_send_desc")} {APP_NAME} will send a 4-digit OTP to verify your number for
          Uttarakhand matrimony &amp; dating.
        </>
      }
      footer={
        <Button type="submit" form="login-form" loading={loading} size="lg" className="w-full">
          {t("continue")}
        </Button>
      }
    >
      <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div
          className={cn(
            "flex items-center gap-0 overflow-hidden rounded-full border-2 bg-white shadow-sm transition-colors",
            errors.phone || error ? "border-destructive" : "border-border/60 focus-within:border-primary"
          )}
        >
          <div className="flex shrink-0 items-center gap-1.5 border-r border-border/60 px-4 py-3.5 text-[15px] font-bold text-foreground">
            <span aria-hidden>🇮🇳</span>
            <span>+91</span>
          </div>
          <input
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            maxLength={10}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-lg font-semibold tracking-wide outline-none placeholder:font-medium placeholder:text-muted-foreground"
          />
        </div>

        {(errors.phone || error) && (
          <p className="text-center text-sm font-medium text-destructive lg:text-left">
            {errors.phone?.message || error}
          </p>
        )}

        <p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
          By continuing, {APP_NAME} sends an SMS with a verification code. Message rates may apply.
          Your number stays private until you choose to share it.
        </p>
      </form>
    </AuthScreenLayout>
  );
}
