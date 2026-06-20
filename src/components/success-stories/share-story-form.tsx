"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SuccessStoryType } from "@/lib/success-stories/types";
import { SUCCESS_STORY_TYPE_LABELS } from "@/lib/success-stories/types";

interface ShareStoryFormProps {
  storyType: SuccessStoryType;
}

export function ShareStoryForm({ storyType }: ShareStoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    submitter_name: "",
    partner_name: "",
    email: "",
    phone: "",
    location: "",
    timeline: "",
    title: "",
    story: "",
    consent: false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/success-stories/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, story_type: storyType }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Could not submit story");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not submit story");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-success">Thank you for sharing!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will review your {SUCCESS_STORY_TYPE_LABELS[storyType].toLowerCase()} before publishing.
        </p>
        <Button className="mt-4" onClick={() => router.push("/success-stories")}>
          View success stories
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <Input
            required
            value={form.submitter_name}
            onChange={(e) => setForm({ ...form, submitter_name: e.target.value })}
          />
        </Field>
        <Field label="Partner's name (optional)">
          <Input
            value={form.partner_name}
            onChange={(e) => setForm({ ...form, partner_name: e.target.value })}
          />
        </Field>
        <Field label="Email (optional)">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City · Region"
          />
        </Field>
        <Field label="Timeline">
          <Input
            value={form.timeline}
            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
            placeholder="Together 1 year / Engaged in 6 months"
          />
        </Field>
      </div>

      <Field label="Story title (optional)">
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="A headline for your story"
        />
      </Field>

      <Field label="Your story">
        <Textarea
          required
          rows={8}
          value={form.story}
          onChange={(e) => setForm({ ...form, story: e.target.value })}
          placeholder="Tell us how you met, what Saathini helped with, and where you are today…"
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
        />
        <span>
          I agree to let Saathini review and optionally publish my story (names may be shown publicly).
        </span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        Submit {SUCCESS_STORY_TYPE_LABELS[storyType].toLowerCase()}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
