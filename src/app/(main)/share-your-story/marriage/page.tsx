import { PageHeader } from "@/components/common/page-header";
import { ShareStoryForm } from "@/components/success-stories/share-story-form";

export default function ShareMarriageStoryPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/share-your-story" title="Marriage story" />
      <div className="px-5 py-4 lg:mx-auto lg:max-w-2xl">
        <p className="mb-5 text-sm text-muted-foreground">
          Share your marriage or engagement story — family involvement, values, and how Saathini brought you together.
        </p>
        <ShareStoryForm storyType="marriage" />
      </div>
    </div>
  );
}
