-- ID & reference (friend/family) verification requests

CREATE TYPE verification_request_status AS ENUM (
  'pending_otp',
  'otp_verified',
  'pending_review',
  'pending_team_call',
  'verified',
  'rejected'
);

CREATE TYPE reference_verification_type AS ENUM ('friend', 'family');

CREATE TYPE id_document_type AS ENUM (
  'aadhaar',
  'pan',
  'driving_license',
  'voter_id',
  'passport'
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

CREATE TRIGGER id_verification_requests_updated_at
  BEFORE UPDATE ON id_verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reference_verification_requests_updated_at
  BEFORE UPDATE ON reference_verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE id_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_verification_requests ENABLE ROW LEVEL SECURITY;

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
