import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Heart, ChevronRight, Users } from "lucide-react";

const OPTIONS = [
  {
    href: "/share-your-story/relationship",
    title: "Relationship story",
    description:
      "Share how you built trust, dated intentionally, or found a serious long-term connection on Saathini.",
    icon: Heart,
    accent: "from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-700",
  },
  {
    href: "/share-your-story/marriage",
    title: "Marriage story",
    description:
      "Tell us about engagement, family meetings, wedding plans, or marriage through Saathini.",
    icon: Users,
    accent: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-700",
  },
] as const;

export default function ShareYourStoryPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack title="Share your story" />

      <div className="px-5 py-4 lg:mx-auto lg:max-w-2xl">
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Inspire others in Uttarakhand. Choose the type of story you want to share — our team reviews every submission before publishing.
        </p>

        <div className="space-y-4">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className={`flex items-start gap-4 rounded-2xl border bg-gradient-to-br p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] active:scale-[0.99] ${option.accent}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">{option.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can also read published stories on{" "}
          <Link href="/success-stories" className="font-semibold text-primary hover:underline">
            Success stories
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
