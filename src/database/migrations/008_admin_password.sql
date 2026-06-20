-- Admin email + password login

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(lower(email)) WHERE email IS NOT NULL;

COMMENT ON COLUMN users.password_hash IS 'bcrypt hash for admin email/password login';
