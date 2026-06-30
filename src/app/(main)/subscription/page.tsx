import { Suspense } from "react";
import SubscriptionPageClient from "./subscription-client";
import { PageSkeleton } from "@/components/common/page-skeleton";

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="subscription" withHeader={false} />}>
      <SubscriptionPageClient />
    </Suspense>
  );
}
