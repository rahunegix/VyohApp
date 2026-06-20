"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Mail, MessageCircle, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";

const FAQ = [
  { q: "How does verification work?", a: "We verify your mobile number, face via selfie video, and optionally your government ID. This builds trust across the platform." },
  { q: "Can I change my intent?", a: "Yes! Your intent can evolve anytime. We track changes transparently so matches understand your current goals." },
  { q: "How does chat work?", a: "All chats are consent-based. Send a request, and the other person can accept or decline. Contact details stay hidden until mutual consent." },
  { q: "Is my data safe?", a: "Absolutely. You control privacy settings, can delete your account anytime, and we never share contact details without permission." },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSent, setTicketSent] = useState(false);

  return (
    <div>
      <PageHeader showBack title="Help & Support" />

      <div className="px-4 py-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/success-stories" className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/50">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-center">Success stories</span>
          </Link>
          <Link href="/share-your-story" className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/50">
            <PenLine className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-center">Share your story</span>
          </Link>
          <a href="mailto:support@saathini.com" className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/50">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Email Us</span>
          </a>
          <button className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/50">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Live Chat</span>
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Frequently Asked</h3>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium"
                >
                  {item.q}
                  {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {!ticketSent ? (
          <div>
            <h3 className="font-semibold mb-3">Submit a Ticket</h3>
            <Textarea placeholder="Describe your issue…" className="mb-3" />
            <Button onClick={() => setTicketSent(true)} className="w-full">Submit</Button>
          </div>
        ) : (
          <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-success">
            Ticket submitted! We&apos;ll respond within 24 hours.
          </div>
        )}
      </div>
    </div>
  );
}
