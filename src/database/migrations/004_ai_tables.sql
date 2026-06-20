-- Saathini AI Tables — Migration 004

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

-- RLS
ALTER TABLE ai_profile_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_starters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_trust_scores ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY ai_starters_insert ON ai_conversation_starters FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id()
);

CREATE POLICY ai_match_explanations_read ON ai_match_explanations FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY ai_match_explanations_insert ON ai_match_explanations FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);

-- Moderation flags: users cannot read queue; insert only for system
CREATE POLICY ai_moderation_insert ON ai_moderation_flags FOR INSERT WITH CHECK (user_id = auth_user_id());

-- updated_at triggers
CREATE TRIGGER ai_profile_summaries_updated_at BEFORE UPDATE ON ai_profile_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_compatibility_updated_at BEFORE UPDATE ON ai_compatibility FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_readiness_updated_at BEFORE UPDATE ON ai_readiness FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_conversation_starters_updated_at BEFORE UPDATE ON ai_conversation_starters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_match_explanations_updated_at BEFORE UPDATE ON ai_match_explanations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_search_queries_updated_at BEFORE UPDATE ON ai_search_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_moderation_flags_updated_at BEFORE UPDATE ON ai_moderation_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_trust_scores_updated_at BEFORE UPDATE ON ai_trust_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profile columns for AI-generated fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_profile_summary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_personality_tags TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_interest_tags TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_relationship_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_communication_style TEXT;
