CREATE TABLE IF NOT EXISTS face_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  selfie_url TEXT NOT NULL,
  profile_photo_url TEXT,
  ai_confidence NUMERIC,
  ai_reason TEXT,
  status verification_request_status NOT NULL DEFAULT 'pending_review',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_face_verification_profile ON face_verification_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_face_verification_status ON face_verification_requests(status);

CREATE TRIGGER face_verification_requests_updated_at
  BEFORE UPDATE ON face_verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
