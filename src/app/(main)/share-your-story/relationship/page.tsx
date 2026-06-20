import { PageHeader } from "@/components/common/page-header";
import { ShareStoryForm } from "@/components/success-stories/share-story-form";

export default function ShareRelationshipStoryPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/share-your-story" title="Relationship story" />
      <div className="px-5 py-4 lg:mx-auto lg:max-w-2xl">
        <p className="mb-5 text-sm text-muted-foreground">
          Tell us about your relationship journey — how you matched, built trust, and what made Saathini different.
        </p>
        <ShareStoryForm storyType="relationship" />
      </div>
    </div>
  );
}
