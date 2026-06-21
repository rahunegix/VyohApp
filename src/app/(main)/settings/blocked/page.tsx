"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-states";

export default function BlockedUsersPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader showBack backHref="/settings" title="Blocked Users" subtitle="Manage blocked profiles" />
      <div className="mx-4 mt-8">
        <EmptyState
          icon="users"
          title="No blocked users"
          description="Users you block won't be able to see your profile or contact you."
        />
      </div>
    </div>
  );
}
