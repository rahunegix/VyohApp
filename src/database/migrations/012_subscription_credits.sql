-- Monthly call/contact credits tracked on active subscription
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS call_credits_remaining INTEGER NOT NULL DEFAULT 0;
