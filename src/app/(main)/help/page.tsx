"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Mail, MessageCircle, BookOpen, PenLine, Phone } from "lucide-react";
import { openHelpChat } from "@/components/common/help-chat-widget";
import { SUPPORT_PHONE } from "@/lib/constants";
import { cn } from "@/lib/helpers/utils";

const FAQ = [
  {
    q: "How does verification work?",
    a: "We verify your mobile number, face via selfie video, and optionally your government ID. This builds trust across the platform.",
  },
  {
    q: "Can I change my intent?",
    a: "Yes! Your intent can evolve anytime. We track changes transparently so matches understand your current goals.",
  },
  {
    q: "How does chat work?",
    a: "All chats are consent-based. Send a request, and the other person can accept or decline. Contact details stay hidden until mutual consent.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. You control privacy settings, can delete your account anytime, and we never share contact details without permission.",
  },
];

const QUICK_LINKS = [
  { href: "/success-stories", icon: BookOpen, label: "Success stories" },
  { href: "/share-your-story", icon: PenLine, label: "Share your story" },
  { href: "mailto:support@saathini.com", icon: Mail, label: "Email us", external: true },
  { href: `tel:${SUPPORT_PHONE}`, icon: Phone, label: "Call support", external: true },
] as const;

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSent, setTicketSent] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack title="Help & Support" subtitle="We're here for you" />

      <div className="space-y-6 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            const className =
              "flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98] hover:bg-muted/30";

            if ("external" in item && item.external) {
              return (
                <a key={item.label} href={item.href} className={className}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-sm font-semibold">{item.label}</span>
                </a>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={className}>
                <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-center text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openHelpChat}
            className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[6px] bg-primary text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-center text-sm font-semibold text-primary">Live chat</span>
          </button>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Frequently asked</h3>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[var(--shadow-soft)]">
            {FAQ.map((item, i) => (
              <div key={i} className={cn(i > 0 && "border-t border-border/50")}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold"
                >
                  {item.q}
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {!ticketSent ? (
          <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-[var(--shadow-soft)]">
            <h3 className="mb-3 font-bold">Submit a ticket</h3>
            <Textarea placeholder="Describe your issue…" className="mb-3 rounded-2xl" />
            <Button onClick={() => setTicketSent(true)} className="w-full">
              Submit
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl bg-success/10 p-4 text-center text-sm font-medium text-success">
            Ticket submitted! We&apos;ll respond within 24 hours.
          </div>
        )}
      </div>
    </div>
  );
}
