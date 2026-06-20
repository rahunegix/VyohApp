import { Suspense } from "react";
import ReportContent from "./report-content";

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading…</div>}>
      <ReportContent />
    </Suspense>
  );
}
