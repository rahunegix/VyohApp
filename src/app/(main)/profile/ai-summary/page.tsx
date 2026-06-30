"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useProfileAiData } from "@/hooks/use-profile-ai-data";
import type { ProfileBuilderOutput } from "@/lib/ai/schemas";

export default function AISummaryPage() {
  const { profile, answers, loading: dataLoading } = useProfileAiData();
  const [ai, setAi] = useState<ProfileBuilderOutput | null>(null);
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
        type: "profile_build",
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
        if (result.data) setAi(result.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate AI summary.");
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
      <div>
        <PageHeader showBack backHref="/profile" title="AI Summary" />
        <div className="px-4 py-8">
          <ListSkeleton count={4} />
        </div>
      </div>
    );
  }

  const longBio = ai?.detailed_bio || ai?.short_bio || profile?.bio || profile?.ai_bio || "";
  const personalityTags = ai?.personality_tags ?? profile?.personality_tags ?? [];
  const interestTags = ai?.interest_tags ?? profile?.interest_tags ?? [];
  const valuesTags = ai?.values_tags ?? profile?.values_tags ?? [];
  const compatibilitySummary =
    ai?.relationship_style ||
    "Best matched with profiles who share similar intent, lifestyle preferences, and openness to Uttarakhand-rooted values.";

  return (
    <div>
      <PageHeader showBack backHref="/profile" title="AI Summary" />
      <div className="px-4 py-4 space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="rounded-2xl bg-primary/5 p-5">
          <p className="text-sm font-medium text-primary mb-2">About You</p>
          <p className="text-sm leading-relaxed">{longBio || "Complete your profile to generate an AI summary."}</p>
        </div>

        {personalityTags.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-2">Personality</p>
            <div className="flex flex-wrap gap-2">
              {personalityTags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
        ) : null}

        {interestTags.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interestTags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {valuesTags.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-2">Values</p>
            <div className="flex flex-wrap gap-2">
              {valuesTags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Compatibility Summary</p>
          <p className="text-sm text-muted-foreground">{compatibilitySummary}</p>
        </div>
      </div>
    </div>
  );
}
