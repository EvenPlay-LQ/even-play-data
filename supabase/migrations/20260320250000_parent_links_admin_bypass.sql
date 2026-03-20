-- =====================================================
-- Master Admin — Parent Links Bypass Stabilization
-- =====================================================
-- Adds the missing RLS bypass for the parent_athlete_links table 
-- which was created prior to the master_admin migration but omitted.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Master admin full access parent_athlete_links') THEN
    CREATE POLICY "Master admin full access parent_athlete_links"
      ON public.parent_athlete_links FOR ALL TO authenticated
      USING (public.is_master_admin(auth.uid()))
      WITH CHECK (public.is_master_admin(auth.uid()));
  END IF;
END $$;
