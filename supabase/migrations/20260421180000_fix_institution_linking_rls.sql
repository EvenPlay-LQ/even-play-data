-- Migration: Fix Institution Athlete Linking RLS
-- Allows institutions to view and link athletes that are not yet associated with any institution.

-- 1. Allow institutions to view athletes who don't have an institution yet
-- This is necessary for searching and linking existing athletes
DROP POLICY IF EXISTS "Institutions can view unassigned athletes" ON public.athletes;
CREATE POLICY "Institutions can view unassigned athletes" ON public.athletes
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'institution') 
  AND institution_id IS NULL
);

-- 2. Allow institutions to link unassigned athletes to themselves
-- This enables the "Link Existing Athlete" feature
DROP POLICY IF EXISTS "Institutions can link unassigned athletes" ON public.athletes;
CREATE POLICY "Institutions can link unassigned athletes" ON public.athletes
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'institution') 
  AND institution_id IS NULL
)
WITH CHECK (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
);

-- 3. Ensure institutions can manage athletes they've linked/created (redundancy check)
-- Migration 20260320230000 already has "Institutions can manage their own athletes"
-- based on institution_id.
