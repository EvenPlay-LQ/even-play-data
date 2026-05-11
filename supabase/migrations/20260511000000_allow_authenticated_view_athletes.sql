-- ==============================================================================
-- Migration: Allow Authenticated Users to View All Athletes
-- Description: The Zone page requires athletes to discover and compare themselves 
-- against other athletes on the platform. Previously, RLS only allowed users to 
-- view their own athlete profile or those managed by their institution/parent.
-- ==============================================================================

CREATE POLICY "Anyone can read athletes"
ON public.athletes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can read athletes anon"
ON public.athletes
FOR SELECT
TO anon
USING (true);
