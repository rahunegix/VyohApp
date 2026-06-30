-- Bootstrap platform columns (run in Supabase SQL Editor if onboarding fails on "platform" column)
-- Safe to re-run. After running, wait ~30s or run: NOTIFY pgrst, 'reload schema';

DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('dating', 'matrimony');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE platform_type ADD VALUE IF NOT EXISTS 'vip';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_platform platform_type NOT NULL DEFAULT 'dating';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS platform platform_type NOT NULL DEFAULT 'dating',
  ADD COLUMN IF NOT EXISTS cross_platform_visible BOOLEAN NOT NULL DEFAULT false;

UPDATE profiles
SET platform = 'matrimony'
WHERE intent = 'marriage' AND platform = 'dating';

CREATE INDEX IF NOT EXISTS idx_profiles_platform ON profiles(platform);
CREATE INDEX IF NOT EXISTS idx_profiles_user_platform ON profiles(user_id, platform);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_platform_unique
  ON profiles(user_id, platform)
  WHERE user_id IS NOT NULL;

-- VIP columns (from 016)
DO $$ BEGIN
  CREATE TYPE vip_approval_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS vip_approval_status vip_approval_status_type,
  ADD COLUMN IF NOT EXISTS vip_details JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vip_invite_code TEXT;

NOTIFY pgrst, 'reload schema';
