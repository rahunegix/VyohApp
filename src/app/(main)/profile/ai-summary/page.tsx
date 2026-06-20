"use client";

import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { DEMO_CURRENT_PROFILE } from "@/services/demo-data";
import { generateAIProfile } from "@/lib/ai/profile-assistant";

const DEMO_ANSWERS = {
  about_self: "I'm a product manager rooted in Garhwal, passionate about building things and exploring the mountains.",
  looking_for: "Someone genuine who values trust and shared growth.",
  partner_fit: "A partner who balances tradition with modern thinking.",
  future_plans: "Building my career while staying connected to my roots in Uttarakhand.",
  relationship_values: "Trust, open communication, and mutual respect above all.",
  family_involvement: "Open to moderate family involvement when the time is right.",
};

export default function AISummaryPage() {
  const ai = generateAIProfile(DEMO_ANSWERS, DEMO_CURRENT_PROFILE.intent);

  return (
    <div>
      <PageHeader showBack backHref="/profile" title="AI Summary" />
      <div className="px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-primary/5 p-5">
          <p className="text-sm font-medium text-primary mb-2">About You</p>
          <p className="text-sm leading-relaxed">{ai.long_bio}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Personality</p>
          <div className="flex flex-wrap gap-2">
            {ai.personality_tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">
            {ai.interest_tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Values</p>
          <div className="flex flex-wrap gap-2">
            {ai.values_tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium mb-1">Compatibility Summary</p>
          <p className="text-sm text-muted-foreground">{ai.compatibility_summary}</p>
        </div>
      </div>
    </div>
  );
}
