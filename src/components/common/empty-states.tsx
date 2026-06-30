"use client";

import { Heart, MessageCircle, Users, Frown } from "lucide-react";

interface EmptyStateProps {
  icon?: "heart" | "message" | "users";
  title: string;
  description: string;
  action?: React.ReactNode;
}

const icons = {
  heart: Heart,
  message: MessageCircle,
  users: Users,
};

export function EmptyState({ icon = "heart", title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[6px] bg-muted">
        <Frown className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
