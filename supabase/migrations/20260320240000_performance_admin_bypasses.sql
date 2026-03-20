-- =====================================================
-- Master Admin — Final RLS Bypass Stabilization
-- =====================================================
-- This migration adds missing RLS bypass policies for master admins 
-- on second-tier tables that were missed in the initial admin migration.

-- 1. athlete_matches
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access athlete_matches') THEN
    CREATE POLICY "Master admin full access athlete_matches"
      ON public.athlete_matches FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- 2. performance_metrics
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access performance_metrics') THEN
    CREATE POLICY "Master admin full access performance_metrics"
      ON public.performance_metrics FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- 3. performance_tests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access performance_tests') THEN
    CREATE POLICY "Master admin full access performance_tests"
      ON public.performance_tests FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- 4. media_gallery
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access media_gallery') THEN
    CREATE POLICY "Master admin full access media_gallery"
      ON public.media_gallery FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- 5. club_history
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access club_history') THEN
    CREATE POLICY "Master admin full access club_history"
      ON public.club_history FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- 6. coach_feedback
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access coach_feedback') THEN
    CREATE POLICY "Master admin full access coach_feedback"
      ON public.coach_feedback FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;
