-- One credit unlocks contact details for a unique match (re-viewing is free)
CREATE TABLE IF NOT EXISTS contact_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_unlocks_user ON contact_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_target ON contact_unlocks(target_profile_id);
