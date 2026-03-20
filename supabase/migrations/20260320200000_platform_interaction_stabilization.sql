-- =====================================================
-- Platform Interaction Stabilization — Migration
-- Fixes missing columns and RLS permission gaps for Institutions
-- =====================================================

-- 1. Correct coach_feedback schema
ALTER TABLE public.coach_feedback 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- 2. Update RLS for coach_feedback (Allow Institutions to manage feedback they gave)
CREATE POLICY "Institutions can manage their feedback" 
  ON public.coach_feedback FOR ALL TO authenticated 
  USING (institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid()))
  WITH CHECK (institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid()));

-- 3. Update RLS for media_gallery (Allow Institutions to upload media for their athletes)
CREATE POLICY "Institutions can manage athlete media" 
  ON public.media_gallery FOR ALL TO authenticated 
  USING (athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  ))
  WITH CHECK (athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  ));

-- 4. Master Admin bypass for all interaction tables
CREATE POLICY "Master admin bypass coach_feedback"
  ON public.coach_feedback FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin bypass media_gallery"
  ON public.media_gallery FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- 5. Ensure storage bucket for athlete_media exists and has policies
-- Note: This assumes the 'athlete_media' bucket exists (defined in previous migration comments)
-- If bucket creation via SQL isn't supported, these are the policies once created:
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('athlete_media', 'athlete_media', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for athlete_media
CREATE POLICY "Public Access athlete_media" 
  ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'athlete_media');

CREATE POLICY "Institutions can upload to athlete_media" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'athlete_media' AND (
      (auth.jwt() ->> 'user_type' = 'institution') OR 
      (public.is_master_admin(auth.uid()))
    )
  );

CREATE POLICY "Athletes can upload to athlete_media" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'athlete_media' AND (
      (auth.jwt() ->> 'user_type' = 'athlete') OR 
      (public.is_master_admin(auth.uid()))
    )
  );
