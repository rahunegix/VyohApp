-- Saathini RLS Policies
-- Migration 002: Row Level Security

-- Enable RLS on all tables
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

-- Helper: get current user's profile id
CREATE OR REPLACE FUNCTION auth_profile_id()
RETURNS UUID AS $$
  SELECT p.id FROM profiles p
  JOIN users u ON u.id = p.user_id
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current app user id
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if blocked
CREATE OR REPLACE FUNCTION is_blocked(profile_a UUID, profile_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_profile_id = profile_a AND blocked_profile_id = profile_b)
       OR (blocker_profile_id = profile_b AND blocked_profile_id = profile_a)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY users_select_own ON users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth_user_id = auth.uid());

-- PROFILES policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (
  user_id = auth_user_id()
);
CREATE POLICY profiles_select_public ON profiles FOR SELECT USING (
  profile_status = 'active'
  AND id != auth_profile_id()
  AND NOT is_blocked(auth_profile_id(), id)
);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (
  user_id = auth_user_id()
);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (
  user_id = auth_user_id()
);
CREATE POLICY profiles_delete_own ON profiles FOR DELETE USING (
  user_id = auth_user_id()
);

-- PROFILE PHOTOS policies
CREATE POLICY photos_select_own ON profile_photos FOR SELECT USING (
  profile_id = auth_profile_id()
);
CREATE POLICY photos_select_public ON profile_photos FOR SELECT USING (
  NOT is_private AND EXISTS (
    SELECT 1 FROM profiles WHERE id = profile_photos.profile_id AND profile_status = 'active'
  )
);
CREATE POLICY photos_insert_own ON profile_photos FOR INSERT WITH CHECK (
  profile_id = auth_profile_id()
);
CREATE POLICY photos_update_own ON profile_photos FOR UPDATE USING (
  profile_id = auth_profile_id()
);
CREATE POLICY photos_delete_own ON profile_photos FOR DELETE USING (
  profile_id = auth_profile_id()
);

-- PROFILE VIDEOS policies
CREATE POLICY videos_select_own ON profile_videos FOR SELECT USING (
  profile_id = auth_profile_id()
);
CREATE POLICY videos_insert_own ON profile_videos FOR INSERT WITH CHECK (
  profile_id = auth_profile_id()
);
CREATE POLICY videos_delete_own ON profile_videos FOR DELETE USING (
  profile_id = auth_profile_id()
);

-- PROFILE ANSWERS policies
CREATE POLICY answers_all_own ON profile_answers FOR ALL USING (
  profile_id = auth_profile_id()
);

-- PERSONALITY / VALUES ANSWERS
CREATE POLICY personality_all_own ON personality_answers FOR ALL USING (
  profile_id = auth_profile_id()
);
CREATE POLICY values_all_own ON values_answers FOR ALL USING (
  profile_id = auth_profile_id()
);

-- INTENT HISTORY
CREATE POLICY intent_history_select_own ON intent_history FOR SELECT USING (
  profile_id = auth_profile_id()
);
CREATE POLICY intent_history_insert_own ON intent_history FOR INSERT WITH CHECK (
  profile_id = auth_profile_id()
);

-- VERIFICATION STATUS
CREATE POLICY verification_select_own ON verification_status FOR SELECT USING (
  profile_id = auth_profile_id()
);
CREATE POLICY verification_select_public ON verification_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = verification_status.profile_id AND profile_status = 'active')
);
CREATE POLICY verification_update_own ON verification_status FOR UPDATE USING (
  profile_id = auth_profile_id()
);

-- TRUST SCORES
CREATE POLICY trust_select_own ON trust_scores FOR SELECT USING (
  profile_id = auth_profile_id()
);
CREATE POLICY trust_select_public ON trust_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = trust_scores.profile_id AND profile_status = 'active')
);

-- RELATIONSHIP READINESS
CREATE POLICY readiness_all_own ON relationship_readiness FOR ALL USING (
  profile_id = auth_profile_id()
);

-- LIKES
CREATE POLICY likes_select_involved ON likes FOR SELECT USING (
  sender_profile_id = auth_profile_id() OR receiver_profile_id = auth_profile_id()
);
CREATE POLICY likes_insert_own ON likes FOR INSERT WITH CHECK (
  sender_profile_id = auth_profile_id()
);
CREATE POLICY likes_delete_own ON likes FOR DELETE USING (
  sender_profile_id = auth_profile_id()
);

-- MATCHES
CREATE POLICY matches_select_involved ON matches FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);

-- CHAT REQUESTS
CREATE POLICY chat_requests_select_involved ON chat_requests FOR SELECT USING (
  sender_profile_id = auth_profile_id() OR receiver_profile_id = auth_profile_id()
);
CREATE POLICY chat_requests_insert_own ON chat_requests FOR INSERT WITH CHECK (
  sender_profile_id = auth_profile_id()
);
CREATE POLICY chat_requests_update_receiver ON chat_requests FOR UPDATE USING (
  receiver_profile_id = auth_profile_id()
);

-- CONVERSATIONS
CREATE POLICY conversations_select_participant ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = conversations.match_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);

-- MESSAGES
CREATE POLICY messages_select_participant ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY messages_insert_participant ON messages FOR INSERT WITH CHECK (
  sender_profile_id = auth_profile_id()
  AND EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);
CREATE POLICY messages_update_own ON messages FOR UPDATE USING (
  sender_profile_id = auth_profile_id()
  OR EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.profile_a_id = auth_profile_id() OR m.profile_b_id = auth_profile_id())
  )
);

-- SUBSCRIPTION PLANS (public read)
CREATE POLICY plans_select_all ON subscription_plans FOR SELECT USING (active = TRUE);

-- SUBSCRIPTIONS
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (
  user_id = auth_user_id()
);
CREATE POLICY subscriptions_insert_own ON subscriptions FOR INSERT WITH CHECK (
  user_id = auth_user_id()
);
CREATE POLICY subscriptions_update_own ON subscriptions FOR UPDATE USING (
  user_id = auth_user_id()
);

-- PAYMENTS
CREATE POLICY payments_select_own ON payments FOR SELECT USING (
  user_id = auth_user_id()
);
CREATE POLICY payments_insert_own ON payments FOR INSERT WITH CHECK (
  user_id = auth_user_id()
);

-- PROFILE VIEWS
CREATE POLICY views_insert_own ON profile_views FOR INSERT WITH CHECK (
  viewer_profile_id = auth_profile_id()
);
CREATE POLICY views_select_own ON profile_views FOR SELECT USING (
  viewer_profile_id = auth_profile_id() OR viewed_profile_id = auth_profile_id()
);

-- REPORTS
CREATE POLICY reports_insert_own ON reports FOR INSERT WITH CHECK (
  reporter_profile_id = auth_profile_id()
);
CREATE POLICY reports_select_own ON reports FOR SELECT USING (
  reporter_profile_id = auth_profile_id()
);

-- BLOCKS
CREATE POLICY blocks_select_involved ON blocks FOR SELECT USING (
  blocker_profile_id = auth_profile_id() OR blocked_profile_id = auth_profile_id()
);
CREATE POLICY blocks_insert_own ON blocks FOR INSERT WITH CHECK (
  blocker_profile_id = auth_profile_id()
);
CREATE POLICY blocks_delete_own ON blocks FOR DELETE USING (
  blocker_profile_id = auth_profile_id()
);

-- NOTIFICATIONS
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (
  user_id = auth_user_id()
);
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (
  user_id = auth_user_id()
);

-- FAMILY ACCOUNTS
CREATE POLICY family_all_own ON family_accounts FOR ALL USING (
  profile_id = auth_profile_id()
);

-- PRIVACY SETTINGS
CREATE POLICY privacy_all_own ON privacy_settings FOR ALL USING (
  profile_id = auth_profile_id()
);

-- COMPATIBILITY SCORES
CREATE POLICY compatibility_select_involved ON compatibility_scores FOR SELECT USING (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);
CREATE POLICY compatibility_insert_system ON compatibility_scores FOR INSERT WITH CHECK (
  profile_a_id = auth_profile_id() OR profile_b_id = auth_profile_id()
);

-- AUDIT LOGS (own reads only for transparency)
CREATE POLICY audit_select_own ON audit_logs FOR SELECT USING (
  user_id = auth_user_id()
);
CREATE POLICY audit_insert_system ON audit_logs FOR INSERT WITH CHECK (
  user_id = auth_user_id()
);

-- SUPPORT TICKETS
CREATE POLICY tickets_all_own ON support_tickets FOR ALL USING (
  user_id = auth_user_id()
);
