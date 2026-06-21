"use client";

import { Heart } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { getReadinessLabel } from "@/lib/helpers/formatters";

const FACTORS = [
  { label: "Self-awareness", score: 85 },
  { label: "Communication clarity", score: 72 },
  { label: "Life goal alignment", score: 68 },
  { label: "Emotional availability", score: 75 },
];

export default function ReadinessPage() {
  const score = DEMO_CURRENT_PROFILE.readiness_score;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/profile" title="Relationship Readiness" subtitle="How prepared you are to connect" />

      <div className="px-4 py-6">
        <div className="rounded-[1.5rem] border border-primary/15 bg-gradient-to-br from-primary/10 to-white p-6 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-7 w-7" fill="currentColor" />
          </div>
          <div className="text-5xl font-extrabold tabular-nums text-primary">{score}%</div>
          <p className="mt-2 text-lg font-bold">{getReadinessLabel(score)}</p>
          <ProgressBar value={score} className="mt-5" showLabel />
        </div>

        <div className="mt-6 rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
          <h3 className="mb-4 font-bold">Readiness factors</h3>
          <div className="space-y-4">
            {FACTORS.map((f) => (
              <div key={f.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="font-bold text-primary">{f.score}%</span>
                </div>
                <ProgressBar value={f.score} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border/50 bg-white p-4 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-soft)]">
          Your readiness score reflects how prepared you are for a meaningful relationship based on your onboarding
          answers, profile completeness, and stated values on Saathini.
        </div>
      </div>
    </div>
  );
}
