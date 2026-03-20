
-- Create storage bucket for profile uploads (documents, photos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-uploads', 'profile-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own folder
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users view own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
