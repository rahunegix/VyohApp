"use client";

import { PageHeader } from "@/components/common/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { getReadinessLabel } from "@/lib/helpers/formatters";

export default function ReadinessPage() {
  const score = DEMO_CURRENT_PROFILE.readiness_score;

  return (
    <div>
      <PageHeader showBack backHref="/profile" title="Relationship Readiness" />
      <div className="px-4 py-6 text-center">
        <div className="text-5xl font-bold text-primary">{score}%</div>
        <p className="mt-2 text-lg font-medium">{getReadinessLabel(score)}</p>
        <ProgressBar value={score} className="mt-6" showLabel />

        <div className="mt-8 text-left space-y-4">
          <h3 className="font-semibold">Readiness Factors</h3>
          {[
            { label: "Self-awareness", score: 85 },
            { label: "Communication clarity", score: 72 },
            { label: "Life goal alignment", score: 68 },
            { label: "Emotional availability", score: 75 },
          ].map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{f.label}</span>
                <span className="font-medium">{f.score}%</span>
              </div>
              <ProgressBar value={f.score} />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-muted/50 p-4 text-left">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your readiness score reflects how prepared you are for a meaningful relationship
            based on your onboarding answers, profile completeness, and stated values.
          </p>
        </div>
      </div>
    </div>
  );
}
