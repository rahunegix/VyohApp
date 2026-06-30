"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useProfileAiData } from "@/hooks/use-profile-ai-data";
import { getReadinessLabel } from "@/lib/helpers/formatters";
import type { ReadinessOutput } from "@/lib/ai/schemas";

const FACTOR_KEYS: { key: keyof ReadinessOutput; label: string }[] = [
  { key: "communication", label: "Communication clarity" },
  { key: "commitment", label: "Commitment readiness" },
  { key: "family_alignment", label: "Family alignment" },
  { key: "emotional_readiness", label: "Emotional availability" },
];

export default function ReadinessPage() {
  const { profile, answers, loading: dataLoading } = useProfileAiData();
  const [data, setData] = useState<ReadinessOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dataLoading || !profile) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "readiness",
        answers,
        intent: profile.intent,
      }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.data) setData(result.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load readiness score.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [answers, dataLoading, profile]);

  if (dataLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24">
        <PageHeader showBack backHref="/profile" title="Relationship Readiness" subtitle="How prepared you are to connect" />
        <div className="px-4 py-8">
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  const score = data?.overall ?? profile?.readiness_score ?? 0;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/profile" title="Relationship Readiness" subtitle="How prepared you are to connect" />

      <div className="px-4 py-6">
        {error ? (
          <p className="mb-4 text-center text-sm text-destructive">{error}</p>
        ) : null}

        <div className="rounded-[6px] border border-primary/15 bg-gradient-to-br from-primary/10 to-white p-6 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <Heart className="h-7 w-7" fill="currentColor" />
          </div>
          <div className="text-5xl font-extrabold tabular-nums text-primary">{score}%</div>
          <p className="mt-2 text-lg font-bold">{getReadinessLabel(score)}</p>
          <ProgressBar value={score} className="mt-5" showLabel />
        </div>

        <div className="mt-6 rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
          <h3 className="mb-4 font-bold">Readiness factors</h3>
          <div className="space-y-4">
            {FACTOR_KEYS.map((f) => {
              const factorScore = data ? Number(data[f.key]) : 0;
              return (
                <div key={f.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{f.label}</span>
                    <span className="font-bold text-primary">{factorScore}%</span>
                  </div>
                  <ProgressBar value={factorScore} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border/50 bg-white p-4 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-soft)]">
          {data?.summary ??
            "Your readiness score reflects how prepared you are for a meaningful relationship based on your onboarding answers, profile completeness, and stated values on Saathini."}
        </div>
      </div>
    </div>
  );
}
