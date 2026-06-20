"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "@/lib/constants";
import { reportUser } from "@/services/actions";

export default function ReportContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profile") ?? "";
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !profileId) return;
    await reportUser({ reported_profile_id: profileId, reason, details });
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader showBack title="Report User" />
      <div className="px-4 py-4">
        {submitted ? (
          <div className="rounded-xl bg-green-50 p-6 text-center text-sm text-success">
            Report submitted. Our safety team will review it promptly.
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">Why are you reporting this profile?</p>
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                    reason === r ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              className="mb-4"
            />
            <Button onClick={handleSubmit} disabled={!reason} className="w-full">
              Submit Report
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
