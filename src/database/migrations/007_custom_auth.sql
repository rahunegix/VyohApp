-- Migration 007: Custom auth (SMS OTP + JWT sessions), admin roles, push tokens

CREATE TYPE user_role_type AS ENUM ('user', 'admin');

ALTER TABLE users ALTER COLUMN auth_user_id DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role_type NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_access_token ON users(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Allow service role full access (API uses admin client)
COMMENT ON COLUMN users.access_token IS 'Current session JWT id (jti) for custom auth';
COMMENT ON COLUMN users.refresh_token_hash IS 'bcrypt hash of refresh token';
