-- Migration: Fix Institution Athlete Insert and Select RLS
-- Description: Ensures institutions can create and read athlete profiles seamlessly, fixing the "new row violates row-level security policy" issue.

-- 1. Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Institutions can create athlete records" ON public.athletes;
DROP POLICY IF EXISTS "Institutions can manage their own athletes" ON public.athletes;
DROP POLICY IF EXISTS "Institutions can view unassigned athletes" ON public.athletes;
DROP POLICY IF EXISTS "Institutions can link unassigned athletes" ON public.athletes;

-- 2. Institutions can view their own athletes AND unassigned athletes
CREATE POLICY "Institutions can view athletes" ON public.athletes
FOR SELECT TO authenticated
USING (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  OR 
  (institution_id IS NULL AND public.has_role(auth.uid(), 'institution'))
);

-- 3. Institutions can insert new athletes for their institution
CREATE POLICY "Institutions can insert athletes" ON public.athletes
FOR INSERT TO authenticated
WITH CHECK (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
);

-- 4. Institutions can update their own athletes OR link unassigned ones
CREATE POLICY "Institutions can update athletes" ON public.athletes
FOR UPDATE TO authenticated
USING (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  OR
  (institution_id IS NULL AND public.has_role(auth.uid(), 'institution'))
)
WITH CHECK (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
);

-- 5. Institutions can delete their own athletes
CREATE POLICY "Institutions can delete athletes" ON public.athletes
FOR DELETE TO authenticated
USING (
  institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
);
