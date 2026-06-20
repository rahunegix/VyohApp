"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthBackButton } from "@/components/auth/auth-back-button";
import { phoneSchema } from "@/lib/validation/schemas";
import { sendPhoneOtp } from "@/lib/auth/phone";
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white lg:overflow-y-auto">
      <div className="flex flex-1 flex-col px-6 pb-10 pt-6 safe-top lg:justify-center lg:px-10 lg:py-12">
        <AuthBackButton href="/onboarding/language" className="mb-6 lg:mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 lg:h-16 lg:w-16"
        >
          <Phone className="h-7 w-7 text-primary lg:h-8 lg:w-8" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h1 className="text-2xl font-extrabold pt-2 tracking-tight text-foreground lg:text-3xl">
            {t("welcome_saathini")}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t("otp_send_desc")}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-1 flex-col lg:mt-10 lg:flex-none"
        >
          <div className="flex-1 lg:flex-none">
            <label className="mb-3 ml-1 block text-xs font-bold uppercase tracking-wider text-foreground">
              {t("mobile_number")}
            </label>
            <div className="flex gap-3">
              <div className="flex h-14 w-[72px] shrink-0 items-center justify-center rounded-[1.25rem] border border-border/50 bg-muted/60 text-[15px] font-bold shadow-sm">
                +91
              </div>
              <Input
                {...register("phone")}
                type="tel"
                placeholder="98765 43210"
                className={cn(
                  "h-14 w-full rounded-[1.25rem] border-2 bg-white px-5 text-lg font-bold tracking-widest shadow-sm transition-colors",
                  errors.phone
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-border/60 focus-visible:border-primary focus-visible:ring-primary/20"
                )}
                maxLength={10}
              />
            </div>
            {errors.phone && (
              <p className="mt-2.5 ml-1 text-sm font-medium text-destructive">{errors.phone.message}</p>
            )}
            {error && (
              <p className="mt-2.5 ml-1 text-sm font-medium text-destructive">{error}</p>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-xs leading-relaxed text-emerald-900/80">
                Your number is used only for verification. We never share it without your consent.
              </p>
            </div>
          </div>

          <Button type="submit" loading={loading} className="mt-8 h-14 w-full rounded-2xl text-[17px] font-bold shadow-lg lg:mt-10">
            {t("send_otp")}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
