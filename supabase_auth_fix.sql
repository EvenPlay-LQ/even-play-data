-- =====================================================================
-- Even Playground — Auth & Onboarding Fix SQL (Consolidated)
-- Run this ENTIRE script in your Supabase SQL Editor
-- =====================================================================

-- ─────────────────────────────────────────────
-- 1. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ─────────────────────────────────────────────
-- This function fires whenever a new auth user is created.
-- It inserts a matching row into public.profiles automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, user_type, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'athlete'),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        user_type = EXCLUDED.user_type;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. PROFILES TABLE — Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow public read access to basic profiles (for community/discovery)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile (fallback if trigger fails)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────
-- 3. ATHLETES TABLE — Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athletes_select_own" ON public.athletes;
CREATE POLICY "athletes_select_own"
  ON public.athletes FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "athletes_insert_own" ON public.athletes;
CREATE POLICY "athletes_insert_own"
  ON public.athletes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "athletes_update_own" ON public.athletes;
CREATE POLICY "athletes_update_own"
  ON public.athletes FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Institutions can also read their athletes
DROP POLICY IF EXISTS "athletes_select_by_institution" ON public.athletes;
CREATE POLICY "athletes_select_by_institution"
  ON public.athletes FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 4. INSTITUTIONS TABLE — Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "institutions_select_own" ON public.institutions;
CREATE POLICY "institutions_select_own"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "institutions_insert_own" ON public.institutions;
CREATE POLICY "institutions_insert_own"
  ON public.institutions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "institutions_update_own" ON public.institutions;
CREATE POLICY "institutions_update_own"
  ON public.institutions FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- ─────────────────────────────────────────────
-- 5. ATHLETE LOGGING TABLES — Row Level Security
-- ─────────────────────────────────────────────
-- athlete_matches
ALTER TABLE IF EXISTS public.athlete_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "athlete_matches_own" ON public.athlete_matches;
CREATE POLICY "athlete_matches_own"
  ON public.athlete_matches FOR ALL
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
  );

-- performance_metrics
ALTER TABLE IF EXISTS public.performance_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "performance_metrics_own" ON public.performance_metrics;
CREATE POLICY "performance_metrics_own"
  ON public.performance_metrics FOR ALL
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
  );

-- club_history
ALTER TABLE IF EXISTS public.club_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "club_history_own" ON public.club_history;
CREATE POLICY "club_history_own"
  ON public.club_history FOR ALL
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 6. INSTITUTION LOGGING TABLES (Data Entry)
-- ─────────────────────────────────────────────
-- performance_tests
ALTER TABLE IF EXISTS public.performance_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perf_tests_read" ON public.performance_tests;
CREATE POLICY "perf_tests_read"
  ON public.performance_tests FOR SELECT
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    OR
    institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "perf_tests_insert" ON public.performance_tests;
CREATE POLICY "perf_tests_insert"
  ON public.performance_tests FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  );

-- coach_feedback
ALTER TABLE IF EXISTS public.coach_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coach_feedback_access" ON public.coach_feedback;
CREATE POLICY "coach_feedback_access"
  ON public.coach_feedback FOR SELECT
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    OR
    institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "coach_feedback_insert" ON public.coach_feedback;
CREATE POLICY "coach_feedback_insert"
  ON public.coach_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 7. MEDIA & MATCHES
-- ─────────────────────────────────────────────
-- media_gallery
ALTER TABLE IF EXISTS public.media_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "media_gallery_access" ON public.media_gallery;
CREATE POLICY "media_gallery_access"
  ON public.media_gallery FOR ALL
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    OR
    athlete_id IN (
      SELECT id FROM public.athletes WHERE institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
      )
    )
  );

-- matches (global read)
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "matches_read" ON public.matches;
CREATE POLICY "matches_read"
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

-- match_stats
ALTER TABLE IF EXISTS public.match_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_stats_access" ON public.match_stats;
CREATE POLICY "match_stats_access"
  ON public.match_stats FOR ALL
  TO authenticated
  USING (
    athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    OR
    athlete_id IN (
      SELECT id FROM public.athletes WHERE institution_id IN (
        SELECT id FROM public.institutions WHERE profile_id = auth.uid()
      )
    )
  );
