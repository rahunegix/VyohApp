-- VIP elite: invite codes, admin approval, profile details
CREATE TYPE vip_approval_status_type AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS vip_approval_status vip_approval_status_type,
  ADD COLUMN IF NOT EXISTS vip_details JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vip_invite_code TEXT;

CREATE TABLE IF NOT EXISTS vip_invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  use_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vip_invite_codes_code ON vip_invite_codes(code);

CREATE TABLE IF NOT EXISTS vip_invite_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code_id UUID NOT NULL REFERENCES vip_invite_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invite_code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vip_invite_redemptions_user ON vip_invite_redemptions(user_id);
