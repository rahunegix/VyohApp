"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-states";

export default function BlockedUsersPage() {
  return (
    <div>
      <PageHeader showBack backHref="/settings" title="Blocked Users" />
      <EmptyState
        icon="users"
        title="No blocked users"
        description="Users you block won't be able to see your profile or contact you."
      />
    </div>
  );
}
