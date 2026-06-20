import { Suspense } from "react";
import SubscriptionPageClient from "./subscription-client";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <SubscriptionPageClient />
    </Suspense>
  );
}
