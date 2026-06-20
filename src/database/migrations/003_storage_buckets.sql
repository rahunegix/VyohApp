-- Storage buckets for Saathini
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-photos-public', 'profile-photos-public', true),
  ('profile-photos-private', 'profile-photos-private', false),
  ('profile-videos', 'profile-videos', false),
  ('documents-private', 'documents-private', false)
ON CONFLICT (id) DO NOTHING;

-- Public photos: anyone can view, owner can upload
CREATE POLICY "Public photos are viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos-public');

CREATE POLICY "Users can upload public photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos-public'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own public photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos-public'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own public photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos-public'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Private photos: owner only
CREATE POLICY "Users can view own private photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-photos-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload private photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Videos: owner only
CREATE POLICY "Users can manage own videos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'profile-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Documents: owner only
CREATE POLICY "Users can manage own documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
