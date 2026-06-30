export const DOMAIN_EVENT_TYPES = [
  "UserSignedUp",
  "OTPVerified",
  "ProfileStarted",
  "ProfileCompleted",
  "PhotoUploaded",
  "FaceVerified",
  "ProfileViewed",
  "ProfileLiked",
  "InterestSent",
  "InterestAccepted",
  "MatchCreated",
  "ConversationStarted",
  "MessageSent",
  "SubscriptionPurchased",
  "ProfilePaused",
  "UserBlocked",
  "UserReported",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[number];

export interface DomainEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  type: DomainEventType;
  userId?: string;
  profileId?: string;
  payload: T;
  idempotencyKey?: string;
  occurredAt: string;
}

export type EventHandler = (event: DomainEvent) => void | Promise<void>;
