-- =====================================================
-- Migration: Allow athletes to access and manage their own invites
-- =====================================================

DO $$ BEGIN
  -- Allow athletes to read invites sent to them
  CREATE POLICY "athletes_read_own_invites" ON public.athlete_invites 
    FOR SELECT USING (
      athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    );

  -- Allow athletes to update invites (e.g. to accept them)
  CREATE POLICY "athletes_update_own_invites" ON public.athlete_invites 
    FOR UPDATE USING (
      athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    );

  -- Allow athletes to delete invites (e.g. to decline them)
  CREATE POLICY "athletes_delete_own_invites" ON public.athlete_invites 
    FOR DELETE USING (
      athlete_id IN (SELECT id FROM public.athletes WHERE profile_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
