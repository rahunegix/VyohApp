-- Dating vs Matrimony: dual personas per user, single database
CREATE TYPE platform_type AS ENUM ('dating', 'matrimony');

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_platform platform_type NOT NULL DEFAULT 'dating';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS platform platform_type NOT NULL DEFAULT 'dating',
  ADD COLUMN IF NOT EXISTS cross_platform_visible BOOLEAN NOT NULL DEFAULT false;

-- Existing marriage intent → matrimony platform
UPDATE profiles SET platform = 'matrimony' WHERE intent = 'marriage';

CREATE INDEX IF NOT EXISTS idx_profiles_platform ON profiles(platform);
CREATE INDEX IF NOT EXISTS idx_profiles_user_platform ON profiles(user_id, platform);

-- One profile per user per platform (seed rows may have null user_id)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_platform_unique
  ON profiles(user_id, platform)
  WHERE user_id IS NOT NULL;
