"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StorySubmissionRecord } from "@/lib/success-stories/types";
import { SUCCESS_STORY_TYPE_LABELS } from "@/lib/success-stories/types";

export function StorySubmissionsAdminPanel({
  initialSubmissions,
}: {
  initialSubmissions: StorySubmissionRecord[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  const updateSubmission = async (
    id: string,
    patch: { status?: StorySubmissionRecord["status"]; publish_as_story?: boolean; admin_notes?: string }
  ) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/story-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Update failed");
        return;
      }
      setSubmissions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Story submissions"
        description={'Review "Share your story" entries from members.'}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              filter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((submission) => (
          <div key={submission.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {submission.submitter_name}
                  {submission.partner_name ? ` & ${submission.partner_name}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {SUCCESS_STORY_TYPE_LABELS[submission.story_type]}
                  {submission.location ? ` · ${submission.location}` : ""}
                  {submission.timeline ? ` · ${submission.timeline}` : ""}
                </p>
              </div>
              <Badge variant={submission.status === "pending" ? "warning" : submission.status === "approved" ? "success" : "secondary"}>
                {submission.status}
              </Badge>
            </div>

            {submission.title && <p className="mt-3 font-medium">{submission.title}</p>}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {submission.story}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              {submission.email || submission.phone || "No contact"} ·{" "}
              {new Date(submission.created_at).toLocaleString()}
            </p>

            {submission.status === "pending" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  loading={loadingId === submission.id}
                  onClick={() => updateSubmission(submission.id, { publish_as_story: true })}
                >
                  <Check className="h-4 w-4" />
                  Approve & publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  loading={loadingId === submission.id}
                  onClick={() => updateSubmission(submission.id, { status: "approved" })}
                >
                  Approve only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  loading={loadingId === submission.id}
                  onClick={() => updateSubmission(submission.id, { status: "rejected" })}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {!filtered.length && (
          <p className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
            No submissions in this filter.
          </p>
        )}
      </div>
    </>
  );
}
