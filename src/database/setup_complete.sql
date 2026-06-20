-- =============================================================================
-- Saathini (VyohApp) — Complete Supabase Database Setup
-- =============================================================================
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Fresh project only. If tables already exist, drop public schema first or
-- use a new Supabase project.
--
-- Auth model: Custom SMS OTP + JWT (NOT Supabase Auth)
-- API routes use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE intent_type AS ENUM ('exploring', 'serious', 'marriage');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE looking_for_type AS ENUM ('male', 'female', 'everyone');
CREATE TYPE region_type AS ENUM ('garhwal', 'kumaon', 'both', 'diaspora');
CREATE TYPE profile_status_type AS ENUM ('draft', 'active', 'hidden', 'suspended');
CREATE TYPE chat_request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE match_status_type AS ENUM ('active', 'unmatched', 'blocked');
CREATE TYPE message_type AS ENUM ('text', 'image', 'voice');
CREATE TYPE subscription_status_type AS ENUM ('active', 'cancelled', 'expired', 'trial');
CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE report_status_type AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE ticket_status_type AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE user_role_type AS ENUM ('user', 'admin');
CREATE TYPE profile_origin_type AS ENUM ('member', 'seed');
CREATE TYPE verification_request_status AS ENUM (
  'pending_otp', 'otp_verified', 'pending_review', 'pending_team_call', 'verified', 'rejected'
);
CREATE TYPE reference_verification_type AS ENUM ('friend', 'family');
CREATE TYPE id_document_type AS ENUM ('aadhaar', 'pan', 'driving_license', 'voter_id', 'passport');
CREATE TYPE bot_chat_state_type AS ENUM ('idle', 'awaiting_user', 'scheduled_reply', 'replied', 'exhausted', 'disabled');
CREATE TYPE bot_message_job_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'cancelled');

-- ─── Users (custom auth — phone OTP + JWT sessions) ──────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  role user_role_type NOT NULL DEFAULT 'user',
  access_token TEXT,
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  otp_hash TEXT,
  otp_expires_at TIMESTAMPTZ,
  otp_attempts INTEGER NOT NULL DEFAULT 0,
  fcm_token TEXT,
  password_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE UNIQUE INDEX idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email_unique ON users(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX idx_users_access_token ON users(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);

COMMENT ON COLUMN users.access_token IS 'Current session JWT id (jti) for custom auth';
COMMENT ON COLUMN users.refresh_token_hash IS 'bcrypt hash of refresh token';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash for admin email/password login';

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  gender gender_type,
  looking_for looking_for_type,
  dob DATE,
  age INTEGER,
  city TEXT,
  district TEXT,
  village TEXT,
  region region_type,
  education TEXT,
  profession TEXT,
  bio TEXT,
  ai_bio TEXT,
  ai_profile_summary TEXT,
  ai_personality_tags TEXT[] DEFAULT '{}',
  ai_interest_tags TEXT[] DEFAULT '{}',
  ai_relationship_style TEXT,
  ai_communication_style TEXT,
  intent intent_type DEFAULT 'exploring',
  profile_status profile_status_type DEFAULT 'draft',
  profile_origin profile_origin_type NOT NULL DEFAULT 'member',
  is_chat_bot BOOLEAN NOT NULL DEFAULT FALSE,
  seed_batch_id TEXT,
  seed_persona_key TEXT,
  bot_chat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  bot_max_replies INTEGER NOT NULL DEFAULT 3,
  admin_notes TEXT,
  trust_score INTEGER DEFAULT 20 CHECK (trust_score >= 0 AND trust_score <= 100),
  compatibility_score INTEGER DEFAULT 0,
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  personality_tags TEXT[] DEFAULT '{}',
  interest_tags TEXT[] DEFAULT '{}',
  values_tags TEXT[] DEFAULT '{}',
  lifestyle JSONB DEFAULT '{}',
  family_background JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_intent ON profiles(intent);
CREATE INDEX idx_profiles_district ON profiles(district);
CREATE INDEX idx_profiles_region ON profiles(region);
CREATE INDEX idx_profiles_status ON profiles(profile_status);
CREATE INDEX idx_profiles_gender_looking ON profiles(gender, looking_for);
CREATE INDEX idx_profiles_origin_status ON profiles(profile_origin, profile_status) WHERE profile_origin = 'seed';
CREATE INDEX idx_profiles_seed_batch ON profiles(seed_batch_id) WHERE seed_batch_id IS NOT NULL;

-- ─── Profile media & answers ─────────────────────────────────────────────────
CREATE TABLE profile_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profile_photos_profile_id ON profile_photos(profile_id);

CREATE TABLE profile_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'selfie_verification',
  is_verified_intro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profile_videos_profile_id ON profile_videos(profile_id);

CREATE TABLE profile_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_label TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, question_key)
);
CREATE INDEX idx_profile_answers_profile_id ON profile_answers(profile_id);

CREATE TABLE personality_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trait_key TEXT NOT NULL,
  trait_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, trait_key)
);

CREATE TABLE values_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value_key TEXT NOT NULL,
  value_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, value_key)
);

CREATE TABLE intent_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_intent intent_type,
  new_intent intent_type NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);
CREATE INDEX idx_intent_history_profile_id ON intent_history(profile_id);

-- ─── Trust & verification ────────────────────────────────────────────────────
CREATE TABLE verification_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  face_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,
  family_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 20 CHECK (score >= 0 AND score <= 100),
  factors JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE relationship_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  summary TEXT,
  factors JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE id_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type id_document_type NOT NULL,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  status verification_request_status NOT NULL DEFAULT 'pending_review',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_id_verification_profile ON id_verification_requests(profile_id);
CREATE INDEX idx_id_verification_status ON id_verification_requests(status);

CREATE TABLE reference_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reference_type reference_verification_type NOT NULL,
  contact_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  otp_hash TEXT,
  otp_expires_at TIMESTAMPTZ,
  otp_verified_at TIMESTAMPTZ,
  status verification_request_status NOT NULL DEFAULT 'pending_otp',
  team_notes TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reference_verification_profile ON reference_verification_requests(profile_id);
CREATE INDEX idx_reference_verification_status ON reference_verification_requests(status);

-- ─── Matching & messaging ────────────────────────────────────────────────────
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sender_profile_id, receiver_profile_id)
);
CREATE INDEX idx_likes_sender ON likes(sender_profile_id);
CREATE INDEX idx_likes_receiver ON likes(receiver_profile_id);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  match_status match_status_type DEFAULT 'active',
  UNIQUE(profile_a_id, profile_b_id)
);
CREATE INDEX idx_matches_profile_a ON matches(profile_a_id);
CREATE INDEX idx_matches_profile_b ON matches(profile_b_id);

CREATE TABLE chat_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status chat_request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_requests_receiver ON chat_requests(receiver_profile_id, status);
CREATE INDEX idx_chat_requests_sender ON chat_requests(sender_profile_id);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_profile_id);

-- ─── Subscriptions & payments ────────────────────────────────────────────────
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status_type DEFAULT 'trial',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  plan_id UUID REFERENCES subscription_plans(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_status payment_status_type DEFAULT 'pending',
  provider TEXT,
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Social & privacy ────────────────────────────────────────────────────────
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_profile_id, created_at DESC);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status_type DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_profile_id, blocked_profile_id)
);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_profile_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_profile_id);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE family_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_user_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_family_accounts_profile ON family_accounts(profile_id);

CREATE TABLE privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  show_photos BOOLEAN DEFAULT TRUE,
  show_city BOOLEAN DEFAULT TRUE,
  show_district BOOLEAN DEFAULT TRUE,
  show_contact BOOLEAN DEFAULT FALSE,
  allow_family_access BOOLEAN DEFAULT FALSE,
  allow_search_indexing BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compatibility_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reasons JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_a_id, profile_b_id)
);
CREATE INDEX idx_compatibility_a ON compatibility_scores(profile_a_id);
CREATE INDEX idx_compatibility_b ON compatibility_scores(profile_b_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status ticket_status_type DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AI cache tables ─────────────────────────────────────────────────────────
CREATE TABLE ai_profile_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_profile_summaries_user ON ai_profile_summaries(user_id);
CREATE UNIQUE INDEX idx_ai_profile_summaries_profile ON ai_profile_summaries(profile_id);

CREATE TABLE ai_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_a_id, profile_b_id)
);
CREATE INDEX idx_ai_compatibility_pair ON ai_compatibility(profile_a_id, profile_b_id);

CREATE TABLE ai_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_ai_readiness_profile ON ai_readiness(profile_id);

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_ai_recommendations_profile ON ai_recommendations(profile_id);

CREATE TABLE ai_conversation_starters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_a_id, profile_b_id)
);

CREATE TABLE ai_match_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_a_id, profile_b_id)
);

CREATE TABLE ai_search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  json_result JSONB NOT NULL DEFAULT '{}',
  query_text TEXT NOT NULL,
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_search_queries_user ON ai_search_queries(user_id, created_at DESC);

CREATE TABLE ai_moderation_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_moderation_status ON ai_moderation_flags(status, created_at DESC);

CREATE TABLE ai_trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  json_result JSONB NOT NULL DEFAULT '{}',
  model_used TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_ai_trust_scores_profile ON ai_trust_scores(profile_id);

-- ─── Admin seed / bot tables ─────────────────────────────────────────────────
CREATE TABLE seed_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_key TEXT UNIQUE NOT NULL,
  gender gender_type NOT NULL,
  display_name_template TEXT NOT NULL,
  region region_type,
  district TEXT,
  city TEXT,
  intent intent_type NOT NULL DEFAULT 'serious',
  bio_template TEXT NOT NULL,
  personality_tags TEXT[] DEFAULT '{}',
  interest_tags TEXT[] DEFAULT '{}',
  values_tags TEXT[] DEFAULT '{}',
  lifestyle JSONB DEFAULT '{}',
  opener_messages TEXT[] NOT NULL DEFAULT '{}',
  reply_messages TEXT[] NOT NULL DEFAULT '{}',
  closing_message TEXT,
  photo_asset_key TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bot_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  seed_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  state bot_chat_state_type NOT NULL DEFAULT 'idle',
  replies_sent INTEGER NOT NULL DEFAULT 0,
  max_replies INTEGER NOT NULL DEFAULT 3,
  last_user_message_at TIMESTAMPTZ,
  next_reply_at TIMESTAMPTZ,
  exhausted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id)
);
CREATE INDEX idx_bot_chat_sessions_next_reply ON bot_chat_sessions(next_reply_at)
  WHERE state = 'scheduled_reply' AND next_reply_at IS NOT NULL;

CREATE TABLE bot_message_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_chat_session_id UUID NOT NULL REFERENCES bot_chat_sessions(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  seed_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status bot_message_job_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  error_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bot_message_jobs_due ON bot_message_jobs(scheduled_for) WHERE status = 'pending';

CREATE TABLE seed_profile_batches (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  target_male INTEGER NOT NULL DEFAULT 0,
  target_female INTEGER NOT NULL DEFAULT 0,
  created_male INTEGER NOT NULL DEFAULT 0,
  created_female INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Functions ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth_profile_id()
RETURNS UUID AS $$
  SELECT p.id FROM profiles p
  JOIN users u ON u.id = p.user_id
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_blocked(profile_a UUID, profile_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_profile_id = profile_a AND blocked_profile_id = profile_b)
       OR (blocker_profile_id = profile_b AND blocked_profile_id = profile_a)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION bot_random_reply_delay()
RETURNS INTERVAL AS $$
BEGIN
  RETURN make_interval(secs => 86400 + floor(random() * (259200 - 86400 + 1))::int);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-create profile + related rows when a user registers via custom auth API
CREATE OR REPLACE FUNCTION handle_new_app_user()
RETURNS TRIGGER AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  INSERT INTO profiles (user_id) VALUES (NEW.id) RETURNING id INTO new_profile_id;
  INSERT INTO verification_status (profile_id) VALUES (new_profile_id);
  INSERT INTO privacy_settings (profile_id) VALUES (new_profile_id);
  INSERT INTO trust_scores (profile_id) VALUES (new_profile_id);
  INSERT INTO relationship_readiness (profile_id) VALUES (new_profile_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM likes
    WHERE sender_profile_id = NEW.receiver_profile_id
    AND receiver_profile_id = NEW.sender_profile_id
  ) THEN
    INSERT INTO matches (profile_a_id, profile_b_id)
    VALUES (
      LEAST(NEW.sender_profile_id, NEW.receiver_profile_id),
      GREATEST(NEW.sender_profile_id, NEW.receiver_profile_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_chat_request_accepted()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT * INTO match_record FROM matches
    WHERE (profile_a_id = NEW.sender_profile_id AND profile_b_id = NEW.receiver_profile_id)
       OR (profile_a_id = NEW.receiver_profile_id AND profile_b_id = NEW.sender_profile_id)
    LIMIT 1;

    IF match_record IS NULL THEN
      INSERT INTO matches (profile_a_id, profile_b_id)
      VALUES (
        LEAST(NEW.sender_profile_id, NEW.receiver_profile_id),
        GREATEST(NEW.sender_profile_id, NEW.receiver_profile_id)
      )
      RETURNING * INTO match_record;
    END IF;

    INSERT INTO conversations (match_id)
    VALUES (match_record.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION enqueue_bot_reply_if_needed(
  p_conversation_id UUID,
  p_member_profile_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_session bot_chat_sessions%ROWTYPE;
  v_seed profiles%ROWTYPE;
  v_reply_text TEXT;
BEGIN
  SELECT bcs.* INTO v_session FROM bot_chat_sessions bcs WHERE bcs.conversation_id = p_conversation_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_session.state IN ('exhausted', 'disabled') THEN RETURN; END IF;

  SELECT * INTO v_seed FROM profiles WHERE id = v_session.seed_profile_id;
  IF NOT FOUND OR NOT v_seed.is_chat_bot OR NOT v_seed.bot_chat_enabled THEN RETURN; END IF;

  IF v_session.replies_sent >= v_session.max_replies THEN
    UPDATE bot_chat_sessions SET state = 'exhausted', exhausted_at = NOW(), updated_at = NOW() WHERE id = v_session.id;
    RETURN;
  END IF;

  SELECT sp.reply_messages[LEAST(v_session.replies_sent + 1, array_length(sp.reply_messages, 1))]
  INTO v_reply_text FROM seed_personas sp WHERE sp.persona_key = v_seed.seed_persona_key;

  IF v_reply_text IS NULL OR v_reply_text = '' THEN
    v_reply_text := 'Namaste! Abhi thoda busy hoon — baad mein baat karte hain.';
  END IF;

  UPDATE bot_chat_sessions
  SET state = 'scheduled_reply', last_user_message_at = NOW(),
      next_reply_at = NOW() + bot_random_reply_delay(), updated_at = NOW()
  WHERE id = v_session.id;

  INSERT INTO bot_message_jobs (bot_chat_session_id, conversation_id, seed_profile_id, message_text, scheduled_for)
  VALUES (v_session.id, p_conversation_id, v_session.seed_profile_id, v_reply_text, NOW() + bot_random_reply_delay());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Triggers ────────────────────────────────────────────────────────────────
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profile_photos_updated_at BEFORE UPDATE ON profile_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER verification_status_updated_at BEFORE UPDATE ON verification_status FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_requests_updated_at BEFORE UPDATE ON chat_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER privacy_settings_updated_at BEFORE UPDATE ON privacy_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER id_verification_requests_updated_at BEFORE UPDATE ON id_verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reference_verification_requests_updated_at BEFORE UPDATE ON reference_verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_profile_summaries_updated_at BEFORE UPDATE ON ai_profile_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_compatibility_updated_at BEFORE UPDATE ON ai_compatibility FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_readiness_updated_at BEFORE UPDATE ON ai_readiness FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_conversation_starters_updated_at BEFORE UPDATE ON ai_conversation_starters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_match_explanations_updated_at BEFORE UPDATE ON ai_match_explanations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_search_queries_updated_at BEFORE UPDATE ON ai_search_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_moderation_flags_updated_at BEFORE UPDATE ON ai_moderation_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_trust_scores_updated_at BEFORE UPDATE ON ai_trust_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER on_app_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_app_user();

CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION check_mutual_like();

CREATE TRIGGER on_chat_request_updated
  AFTER UPDATE ON chat_requests
  FOR EACH ROW EXECUTE FUNCTION handle_chat_request_accepted();

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE values_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_starters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_message_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_profile_batches ENABLE ROW LEVEL SECURITY;

-- Core policies (service role bypasses RLS — used by Next.js API)
CREATE POLICY users_select_own ON users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY profiles_select_public ON profiles FOR SELECT USING (
  profile_status = 'active' AND id != auth_profile_id() AND NOT is_blocked(auth_profile_id(), id)
);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (user_id = auth_user_id());
CREATE POLICY profiles_delete_own ON profiles FOR DELETE USING (user_id = auth_user_id());
CREATE POLICY photos_select_own ON profile_photos FOR SELECT USING (profile_id = auth_profile_id());
CREATE POLICY photos_select_public ON profile_photos FOR SELECT USING (
  NOT is_private AND EXISTS (SELECT 1 FROM profiles WHERE id = profile_photos.profile_id AND profile_status = 'active')
);
CREATE POLICY photos_insert_own ON profile_photos FOR INSERT WITH CHECK (profile_id = auth_profile_id());
CREATE POLICY photos_update_own ON profile_photos FOR UPDATE USING (profile_id = auth_profile_id());
CREATE POLICY photos_delete_own ON profile_photos FOR DELETE USING (profile_id = auth_profile_id());
CREATE POLICY videos_select_own ON profile_videos FOR SELECT USING (profile_id = auth_profile_id());
CREATE POLICY videos_insert_own ON profile_videos FOR INSERT WITH CHECK (profile_id = auth_profile_id());
CREATE POLICY videos_delete_own ON profile_videos FOR DELETE USING (profile_id = auth_profile_id());
CREATE POLICY answers_all_own ON profile_answers FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY personality_all_own ON personality_answers FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY values_all_own ON values_answers FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY intent_history_select_own ON intent_history FOR SELECT USING (profile_id = auth_profile_id());
CREATE POLICY intent_history_insert_own ON intent_history FOR INSERT WITH CHECK (profile_id = auth_profile_id());
CREATE POLICY verification_select_own ON verification_status FOR SELECT USING (profile_id = auth_profile_id());
CREATE POLICY verification_select_public ON verification_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = verification_status.profile_id AND profile_status = 'active')
);
CREATE POLICY verification_update_own ON verification_status FOR UPDATE USING (profile_id = auth_profile_id());
CREATE POLICY trust_select_own ON trust_scores FOR SELECT USING (profile_id = auth_profile_id());
CREATE POLICY trust_select_public ON trust_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = trust_scores.profile_id AND profile_status = 'active')
);
CREATE POLICY readiness_all_own ON relationship_readiness FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY likes_select_involved ON likes FOR SELECT USING (
  sender_profile_id = auth_profile_id() OR receiver_profile_id = auth_profile_id()
);
CREATE POLICY likes_insert_own ON likes FOR INSERT WITH CHECK (sender_profile_id = auth_profile_id());
CREATE POLICY likes_delete_own ON likes FOR DELETE USING (sender_profile_id = auth_profile_id());
CREATE POLICY matches_select_involved ON matches FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY chat_requests_select_involved ON chat_requests FOR SELECT USING (
  sender_profile_id = auth_profile_id() OR receiver_profile_id = auth_profile_id()
);
CREATE POLICY chat_requests_insert_own ON chat_requests FOR INSERT WITH CHECK (sender_profile_id = auth_profile_id());
CREATE POLICY chat_requests_update_receiver ON chat_requests FOR UPDATE USING (receiver_profile_id = auth_profile_id());
CREATE POLICY conversations_select_participant ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches m WHERE m.id = conversations.match_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY messages_select_participant ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY messages_insert_participant ON messages FOR INSERT WITH CHECK (
  sender_profile_id = auth_profile_id()
  AND EXISTS (
    SELECT 1 FROM conversations c JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY messages_update_own ON messages FOR UPDATE USING (
  sender_profile_id = auth_profile_id()
  OR EXISTS (
    SELECT 1 FROM conversations c JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY plans_select_all ON subscription_plans FOR SELECT USING (active = TRUE);
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY subscriptions_insert_own ON subscriptions FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY subscriptions_update_own ON subscriptions FOR UPDATE USING (user_id = auth_user_id());
CREATE POLICY payments_select_own ON payments FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY payments_insert_own ON payments FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY views_insert_own ON profile_views FOR INSERT WITH CHECK (viewer_profile_id = auth_profile_id());
CREATE POLICY views_select_own ON profile_views FOR SELECT USING (
  viewer_profile_id = auth_profile_id() OR viewed_profile_id = auth_profile_id()
);
CREATE POLICY reports_insert_own ON reports FOR INSERT WITH CHECK (reporter_profile_id = auth_profile_id());
CREATE POLICY reports_select_own ON reports FOR SELECT USING (reporter_profile_id = auth_profile_id());
CREATE POLICY blocks_select_involved ON blocks FOR SELECT USING (
  blocker_profile_id = auth_profile_id() OR blocked_profile_id = auth_profile_id()
);
CREATE POLICY blocks_insert_own ON blocks FOR INSERT WITH CHECK (blocker_profile_id = auth_profile_id());
CREATE POLICY blocks_delete_own ON blocks FOR DELETE USING (blocker_profile_id = auth_profile_id());
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth_user_id());
CREATE POLICY family_all_own ON family_accounts FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY privacy_all_own ON privacy_settings FOR ALL USING (profile_id = auth_profile_id());
CREATE POLICY compatibility_select_involved ON compatibility_scores FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY compatibility_insert_system ON compatibility_scores FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY audit_select_own ON audit_logs FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY audit_insert_system ON audit_logs FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY tickets_all_own ON support_tickets FOR ALL USING (user_id = auth_user_id());
CREATE POLICY id_verification_select_own ON id_verification_requests FOR SELECT USING (
  profile_id IN (SELECT p.id FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.auth_user_id = auth.uid())
);
CREATE POLICY id_verification_insert_own ON id_verification_requests FOR INSERT WITH CHECK (
  profile_id IN (SELECT p.id FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.auth_user_id = auth.uid())
);
CREATE POLICY reference_verification_select_own ON reference_verification_requests FOR SELECT USING (
  profile_id IN (SELECT p.id FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.auth_user_id = auth.uid())
);
CREATE POLICY reference_verification_insert_own ON reference_verification_requests FOR INSERT WITH CHECK (
  profile_id IN (SELECT p.id FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.auth_user_id = auth.uid())
);
CREATE POLICY reference_verification_update_own ON reference_verification_requests FOR UPDATE USING (
  profile_id IN (SELECT p.id FROM profiles p JOIN users u ON p.user_id = u.id WHERE u.auth_user_id = auth.uid())
);
CREATE POLICY ai_profile_summaries_own ON ai_profile_summaries FOR ALL USING (user_id = auth_user_id());
CREATE POLICY ai_readiness_own ON ai_readiness FOR ALL USING (user_id = auth_user_id());
CREATE POLICY ai_recommendations_own ON ai_recommendations FOR ALL USING (user_id = auth_user_id());
CREATE POLICY ai_trust_scores_own ON ai_trust_scores FOR ALL USING (user_id = auth_user_id());
CREATE POLICY ai_search_queries_own ON ai_search_queries FOR ALL USING (user_id = auth_user_id());
CREATE POLICY ai_compatibility_read ON ai_compatibility FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_compatibility_insert ON ai_compatibility FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_starters_read ON ai_conversation_starters FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_starters_insert ON ai_conversation_starters FOR INSERT WITH CHECK (profile_a_id = auth_profile_id());
CREATE POLICY ai_match_explanations_read ON ai_match_explanations FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_match_explanations_insert ON ai_match_explanations FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_moderation_insert ON ai_moderation_flags FOR INSERT WITH CHECK (user_id = auth_user_id());

-- ─── Storage buckets ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-photos-public', 'profile-photos-public', true),
  ('profile-photos-private', 'profile-photos-private', false),
  ('profile-videos', 'profile-videos', false),
  ('documents-private', 'documents-private', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public photos are viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos-public');
CREATE POLICY "Users can upload public photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-photos-public' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own public photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-photos-public' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own public photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-photos-public' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own private photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos-private' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload private photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-photos-private' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can manage own videos" ON storage.objects
  FOR ALL USING (bucket_id = 'profile-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can manage own documents" ON storage.objects
  FOR ALL USING (bucket_id = 'documents-private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Success stories + SEO (migrations 009–010) ─────────────────────────────
CREATE TYPE success_story_type AS ENUM ('relationship', 'marriage');
CREATE TYPE success_story_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE story_submission_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  story_type success_story_type NOT NULL,
  names TEXT NOT NULL,
  location TEXT,
  timeline TEXT,
  quote TEXT NOT NULL,
  body TEXT,
  cover_image_url TEXT NOT NULL,
  gallery_image_urls TEXT[] NOT NULL DEFAULT '{}',
  alt_text TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status success_story_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_success_stories_status ON success_stories(status);
CREATE INDEX idx_success_stories_type ON success_stories(story_type);
CREATE INDEX idx_success_stories_featured ON success_stories(is_featured) WHERE status = 'published';

CREATE TABLE story_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  story_type success_story_type NOT NULL,
  submitter_name TEXT NOT NULL,
  partner_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  timeline TEXT,
  title TEXT,
  story TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status story_submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_story_submissions_status ON story_submissions(status);
CREATE INDEX idx_story_submissions_user ON story_submissions(user_id);

INSERT INTO success_stories (
  slug, story_type, names, location, timeline, quote, body,
  cover_image_url, alt_text, is_featured, status, sort_order, published_at
) VALUES
(
  'ankit-priya-marriage', 'marriage', 'Ankit & Priya', 'Dehradun · Garhwal', 'Engaged in 4 months',
  'Our families met through Saathini after we matched on values and gotra preferences. The mandap felt like it was always meant to be.',
  'Ankit from Dehradun and Priya from a Garhwali family connected on Saathini through shared values and family preferences.',
  'https://images.unsplash.com/photo-1583934270204-75a0e3b05ec5?auto=format&fit=crop&w=900&q=80',
  'Hindu wedding ceremony with sacred fire and rituals', TRUE, 'published', 1, NOW()
),
(
  'rohit-kavya-relationship', 'relationship', 'Rohit & Kavya', 'Nainital · Kumaon', 'Together 18 months',
  'We chose the serious relationship path first. Saathini helped us build trust before our families got involved — no rush, just clarity.',
  'Rohit and Kavya matched in Nainital while both were looking for a serious, long-term relationship.',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80',
  'Indian wedding couple in traditional attire', TRUE, 'published', 2, NOW()
),
(
  'aditya-ishita-relationship', 'relationship', 'Aditya & Ishita', 'Haridwar · Uttarakhand', 'First date in 2 weeks',
  'Verified profiles and consent-first chats made us comfortable exploring a connection. We are taking it one meaningful step at a time.',
  'Aditya and Ishita began with a verified match in Haridwar.',
  'https://images.unsplash.com/photo-1522673607200-8d87521a1536?auto=format&fit=crop&w=900&q=80',
  'Indian couple celebrating together', TRUE, 'published', 3, NOW()
)
ON CONFLICT (slug) DO NOTHING;

CREATE TYPE seo_page_kind AS ENUM ('static', 'programmatic');

CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_path TEXT UNIQUE NOT NULL,
  page_kind seo_page_kind NOT NULL DEFAULT 'static',
  slug TEXT,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_path TEXT,
  robots_index BOOLEAN NOT NULL DEFAULT TRUE,
  robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
  h1 TEXT,
  hero_subtitle TEXT,
  intro_html TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  focus_keywords TEXT[] NOT NULL DEFAULT '{}',
  related_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_pages_kind ON seo_pages(page_kind);
CREATE INDEX idx_seo_pages_published ON seo_pages(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_seo_pages_slug ON seo_pages(slug) WHERE slug IS NOT NULL;

INSERT INTO seo_pages (
  route_path, page_kind, slug, title, meta_description, meta_keywords,
  h1, hero_subtitle, intro_html, sections, faq, focus_keywords, related_links,
  is_published, sort_order
)
SELECT * FROM (VALUES
  ('/'::text, 'static'::seo_page_kind, NULL::text,
   'Saathini — Uttarakhand Matrimony & Dating | Garhwali & Kumaoni Matches',
   'Saathini is Uttarakhand''s verified matrimony and dating platform for Garhwali & Kumaoni singles.',
   'uttarakhand matrimony, garhwali matrimony, kumaoni matrimony, alternative to Maangal Platform, alternative to shadi.com',
   'Uttarakhand''s trusted matrimony & dating platform',
   'Garhwali · Kumaoni · Verified profiles · Hindu marriage & serious relationships',
   '<p>Saathini connects Uttarakhand singles and families with intent-first matching.</p>',
   '[]'::jsonb, '[]'::jsonb,
   ARRAY['uttarakhand matrimony','garhwali matrimony']::text[],
   '[]'::jsonb, TRUE, 0),
  ('/welcome', 'static', NULL,
   'Welcome to Saathini — Start Your Uttarakhand Match Journey',
   'Join Saathini — verified Uttarakhand matrimony and dating.',
   'saathini welcome, uttarakhand matrimony signup',
   'Welcome to Saathini', 'From connection to commitment — built for Uttarakhand',
   NULL, '[]'::jsonb, '[]'::jsonb, ARRAY['saathini']::text[], '[]'::jsonb, TRUE, 1),
  ('/matrimony/uttarakhand-matrimony', 'programmatic', 'uttarakhand-matrimony',
   'Uttarakhand Matrimony — Garhwali & Kumaoni Matrimonial Site | Saathini',
   'Find verified Uttarakhand matrimony matches on Saathini.',
   'uttarakhand matrimony, uttarakhand matrimonial site',
   'Uttarakhand matrimony — verified Pahadi matches',
   'The dedicated matrimonial platform for Garhwal, Kumaon & diaspora families',
   NULL, '[]'::jsonb, '[]'::jsonb, ARRAY['uttarakhand matrimony']::text[], '[]'::jsonb, TRUE, 10),
  ('/matrimony/alternative-maangal-com', 'programmatic', 'alternative-maangal-com',
   'Alternative to Maangal Platform — Uttarakhand Matrimony on Saathini',
   'Looking for an alternative to Maangal Platform? Saathini offers verified Uttarakhand matrimony.',
   'alternative to Maangal Platform, Maangal Platform alternative',
   'A trusted alternative to Maangal Platform for Uttarakhand',
   'Local focus · Verified profiles · Garhwali & Kumaoni communities',
   NULL, '[]'::jsonb, '[]'::jsonb, ARRAY['alternative to Maangal Platform']::text[], '[]'::jsonb, TRUE, 20),
  ('/matrimony/alternative-shadi-com', 'programmatic', 'alternative-shadi-com',
   'Alternative to Shaadi.com — Uttarakhand Matrimony | Saathini',
   'Saathini is a focused alternative to Shaadi.com for Uttarakhand singles.',
   'alternative to shadi.com, shaadi.com alternative uttarakhand',
   'Alternative to Shaadi.com — built for Uttarakhand',
   'Less noise · More local matches · Verified Pahadi profiles',
   NULL, '[]'::jsonb, '[]'::jsonb, ARRAY['alternative to shadi.com']::text[], '[]'::jsonb, TRUE, 21)
) AS v(route_path, page_kind, slug, title, meta_description, meta_keywords, h1, hero_subtitle, intro_html, sections, faq, focus_keywords, related_links, is_published, sort_order)
ON CONFLICT (route_path) DO NOTHING;

-- Full SEO seed (homepage FAQ, all programmatic pages): run migrations/010_seo_system.sql on existing DBs

-- ─── Seed data ───────────────────────────────────────────────────────────────
INSERT INTO subscription_plans (name, price, billing_cycle, features, active) VALUES
('Free', 0, 'monthly', '["Limited likes", "Basic discovery", "Chat requests", "Profile creation"]', true),
('Premium', 499, 'monthly', '["Unlimited likes", "Advanced filters", "See who liked you", "Profile boost", "Compatibility insights", "More contact unlocks"]', true),
('Premium Plus', 999, 'monthly', '["Everything in Premium", "Family-managed support", "Extra visibility", "Enhanced trust badge", "Priority placement"]', true);

-- ─── Post-setup: create admin via CLI ───────────────────────────────────────
-- node scripts/create-admin.mjs admin@saathini.com YourSecurePassword123
-- Then login at /admin/login
