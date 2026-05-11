-- ==============================================================================
-- Migration: Allow Authenticated Users to View Club History
-- Description: Enables public discovery on the platform. Allows authenticated 
-- users to view the career history of athletes so that profile pages can display 
-- complete career details.
-- ==============================================================================

CREATE POLICY "Anyone can read club history"
ON public.club_history
FOR SELECT
TO authenticated, anon
USING (true);
