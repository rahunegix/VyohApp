"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { AuthScreenLayout } from "@/components/auth/auth-screen-layout";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { phoneSchema } from "@/lib/validation/schemas";
import { APP_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { cn } from "@/lib/helpers/utils";
import { getPostAuthPath } from "@/lib/auth/profile";
import { redirectAfterAuth } from "@/lib/auth/redirect-after-auth";

type PhoneForm = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t, hydrated } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { register, handleSubmit, formState: { errors } } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  useEffect(() => {
    const mode = sessionStorage.getItem("saathini_auth_mode");
    if (mode === "login" || mode === "signup") {
      setAuthMode(mode);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success || !json.data?.profile) return;
        redirectAfterAuth(getPostAuthPath(json.data.profile as Record<string, unknown>));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSubmit = async (data: PhoneForm) => {
    setLoading(true);
    setError("");
    try {
      sessionStorage.setItem("saathini_phone", data.phone);
      sessionStorage.removeItem("saathini_otp_sent");
      router.push("/otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("otp_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return <PageSkeleton variant="auth" withHeader={false} className="min-h-dvh" />;

  return (
    <AuthScreenLayout
      backHref="/"
      title={authMode === "login" ? t("sign_in") : t("welcome_saathini")}
      subtitle={
        <>
          {t("otp_send_desc")} {APP_NAME} will send a 4-digit OTP to verify your number for
          Uttarakhand matrimony &amp; dating.
        </>
      }
      footer={
        <Button
          type="submit"
          form="login-form"
          loading={loading}
          size="lg"
          className="h-13 w-full text-[17px] font-bold shadow-[var(--shadow-glow)]"
        >
          {t("continue")}
        </Button>
      }
    >
      <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label={t("mobile_number")} error={errors.phone?.message || error || undefined}>
          <div
            className={cn(
              "flex items-center gap-0 overflow-hidden rounded-[6px] border border-border/80 bg-background shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
              errors.phone || error ? "border-destructive focus-within:ring-destructive/20" : ""
            )}
          >
            <div className="flex shrink-0 items-center gap-1.5 border-r border-border/60 px-4 py-3 text-sm font-bold text-foreground">
              <span aria-hidden>🇮🇳</span>
              <span>+91</span>
            </div>
            <Input
              {...register("phone")}
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              maxLength={10}
              className="h-11 border-0 bg-transparent px-4 shadow-none focus-visible:ring-0 focus-visible:border-transparent"
            />
          </div>
        </FormField>

        <p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
          By continuing, {APP_NAME} sends an SMS with a verification code. Message rates may apply.
          Your number stays private until you choose to share it.
        </p>
      </form>
    </AuthScreenLayout>
  );
}
