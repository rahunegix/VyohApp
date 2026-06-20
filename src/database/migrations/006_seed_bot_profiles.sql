-- Migration 006: Admin seed profiles + delayed bot chat queue
-- Run in Supabase SQL editor after 005_verification_requests.sql
--
-- PURPOSE: Support 300M / 200F admin-created discover profiles and async bot replies
-- (24–72h delay, limited scripted replies). NOT for impersonating real people.

-- ---------------------------------------------------------------------------
-- Profile origin (real members vs admin seed)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE profile_origin_type AS ENUM ('member', 'seed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_origin profile_origin_type NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS is_chat_bot BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seed_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS seed_persona_key TEXT,
  ADD COLUMN IF NOT EXISTS bot_chat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bot_max_replies INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Seed profiles do not require a linked member user (admin-managed)
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_origin_status
  ON profiles(profile_origin, profile_status)
  WHERE profile_origin = 'seed';

CREATE INDEX IF NOT EXISTS idx_profiles_seed_batch
  ON profiles(seed_batch_id)
  WHERE seed_batch_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Persona templates (Uttarakhand-themed copy, no real-person photos)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seed_personas (
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

-- ---------------------------------------------------------------------------
-- Per-conversation bot state (real user <-> seed profile)
-- ---------------------------------------------------------------------------
CREATE TYPE bot_chat_state_type AS ENUM (
  'idle',
  'awaiting_user',
  'scheduled_reply',
  'replied',
  'exhausted',
  'disabled'
);

CREATE TABLE IF NOT EXISTS bot_chat_sessions (
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

CREATE INDEX IF NOT EXISTS idx_bot_chat_sessions_next_reply
  ON bot_chat_sessions(next_reply_at)
  WHERE state = 'scheduled_reply' AND next_reply_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Outbound message queue (processed by cron / edge worker with service role)
-- ---------------------------------------------------------------------------
CREATE TYPE bot_message_job_status AS ENUM (
  'pending',
  'processing',
  'sent',
  'failed',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS bot_message_jobs (
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

CREATE INDEX IF NOT EXISTS idx_bot_message_jobs_due
  ON bot_message_jobs(scheduled_for)
  WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- Seed batch tracking (e.g. batch-001: 300M + 200F)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seed_profile_batches (
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

-- ---------------------------------------------------------------------------
-- RLS: seed/bot tables are service-role / admin only (no public access)
-- ---------------------------------------------------------------------------
ALTER TABLE seed_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_message_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_profile_batches ENABLE ROW LEVEL SECURITY;

-- Members can still see seed profiles in discover (active seed profiles)
-- but cannot read bot internals. Existing profiles_select_public policy applies
-- when profile_status = 'active'.

-- ---------------------------------------------------------------------------
-- Helper: random delay between 24h and 72h
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION bot_random_reply_delay()
RETURNS INTERVAL AS $$
BEGIN
  -- random seconds in [86400, 259200] = 24h to 72h
  RETURN make_interval(secs => 86400 + floor(random() * (259200 - 86400 + 1))::int);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- Queue next bot reply when a real user messages a seed bot profile
-- (Call from app server action or DB trigger on messages INSERT)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enqueue_bot_reply_if_needed(
  p_conversation_id UUID,
  p_member_profile_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_session bot_chat_sessions%ROWTYPE;
  v_seed profiles%ROWTYPE;
  v_reply_text TEXT;
  v_reply_index INTEGER;
BEGIN
  SELECT bcs.* INTO v_session
  FROM bot_chat_sessions bcs
  WHERE bcs.conversation_id = p_conversation_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_session.state = 'exhausted' OR v_session.state = 'disabled' THEN
    RETURN;
  END IF;

  SELECT * INTO v_seed FROM profiles WHERE id = v_session.seed_profile_id;
  IF NOT FOUND OR NOT v_seed.is_chat_bot OR NOT v_seed.bot_chat_enabled THEN
    RETURN;
  END IF;

  IF v_session.replies_sent >= v_session.max_replies THEN
    UPDATE bot_chat_sessions
    SET state = 'exhausted', exhausted_at = NOW(), updated_at = NOW()
    WHERE id = v_session.id;
    RETURN;
  END IF;

  SELECT sp.reply_messages[LEAST(v_session.replies_sent + 1, array_length(sp.reply_messages, 1))]
  INTO v_reply_text
  FROM seed_personas sp
  WHERE sp.persona_key = v_seed.seed_persona_key;

  IF v_reply_text IS NULL OR v_reply_text = '' THEN
    v_reply_text := 'Namaste! Abhi thoda busy hoon — baad mein baat karte hain.';
  END IF;

  UPDATE bot_chat_sessions
  SET
    state = 'scheduled_reply',
    last_user_message_at = NOW(),
    next_reply_at = NOW() + bot_random_reply_delay(),
    updated_at = NOW()
  WHERE id = v_session.id;

  INSERT INTO bot_message_jobs (
    bot_chat_session_id,
    conversation_id,
    seed_profile_id,
    message_text,
    scheduled_for
  ) VALUES (
    v_session.id,
    p_conversation_id,
    v_session.seed_profile_id,
    v_reply_text,
    NOW() + bot_random_reply_delay()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE seed_personas IS
  'Admin-defined fictional personas. Use licensed/AI-generated photos only — never scrape social media.';
COMMENT ON TABLE bot_message_jobs IS
  'Processed by scheduled worker (cron). Sends message as seed profile after 24–72h delay.';
