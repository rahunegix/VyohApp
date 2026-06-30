-- Part 6/9: domain events + AI memory (isolated from profile)

CREATE TABLE IF NOT EXISTS domain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_events_user ON domain_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'onboarding',
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_memories_user_key
  ON ai_user_memories(user_id, memory_key)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_memories_profile ON ai_user_memories(profile_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER ai_user_memories_updated_at
  BEFORE UPDATE ON ai_user_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY domain_events_insert ON domain_events FOR INSERT WITH CHECK (true);
CREATE POLICY ai_memories_own ON ai_user_memories FOR ALL USING (user_id = auth.uid());
