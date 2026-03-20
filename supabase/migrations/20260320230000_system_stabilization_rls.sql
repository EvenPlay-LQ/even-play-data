-- Final System Stabilization: RLS Policies for Cross-Role Interactions
-- This migration ensures that institutions and parents can perform their necessary roles.

-- 1. Profiles: Allow institutions to create athlete profiles
CREATE POLICY "Institutions can insert athlete profiles" ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK (
    public.has_role(auth.uid(), 'institution') 
    AND user_type = 'athlete'
);

-- 2. User Roles: Allow institutions to assign 'athlete' role to new profiles
CREATE POLICY "Institutions can assign athlete roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'institution')
    AND role = 'athlete'
);

-- 3. Athletes: Allow institutions to manage athlete records linked to them
-- We use a policy that checks if the institution_id belongs to the authenticated user's profile
CREATE POLICY "Institutions can manage their own athletes" ON public.athletes
FOR ALL TO authenticated
USING (
    institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
);

-- 4. Coach Feedback: Allow institutions to insert and manage feedback
CREATE POLICY "Institutions can manage their feedback" ON public.coach_feedback
FOR ALL TO authenticated
USING (
    institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
);

-- 5. Media Gallery: Allow institutions to upload media for their athletes
CREATE POLICY "Institutions can manage athlete media" ON public.media_gallery
FOR ALL TO authenticated
USING (
    athlete_id IN (
        SELECT a.id FROM public.athletes a
        JOIN public.institutions i ON a.institution_id = i.id
        WHERE i.profile_id = auth.uid()
    )
)
WITH CHECK (
    athlete_id IN (
        SELECT a.id FROM public.athletes a
        JOIN public.institutions i ON a.institution_id = i.id
        WHERE i.profile_id = auth.uid()
    )
);

-- 6. Match Stats: Allow institutions to manage stats for matches they are involved in
CREATE POLICY "Institutions can manage match stats" ON public.match_stats
FOR ALL TO authenticated
USING (
    athlete_id IN (
        SELECT a.id FROM public.athletes a
        JOIN public.institutions i ON a.institution_id = i.id
        WHERE i.profile_id = auth.uid()
    )
);

-- 7. Master Admin Full Access (Bypass) for Performance Tables
-- These were missing from the 20260320180000_master_admin.sql migration

CREATE POLICY "Master admin full access athlete_matches"
  ON public.athlete_matches FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access performance_metrics"
  ON public.performance_metrics FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access media_gallery"
  ON public.media_gallery FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access club_history"
  ON public.club_history FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access coach_feedback"
  ON public.coach_feedback FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access performance_tests"
  ON public.performance_tests FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));
