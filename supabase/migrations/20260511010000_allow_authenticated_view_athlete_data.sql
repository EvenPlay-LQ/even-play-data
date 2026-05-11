-- ==============================================================================
-- Migration: Allow Authenticated Users to View Athlete Data
-- Description: Enables public discovery on the platform. Allows authenticated 
-- users to view athlete matches, performance metrics, and media gallery items 
-- so that profile pages and the Zone page can display comparative data.
-- ==============================================================================

-- 1. athlete_matches
CREATE POLICY "Anyone can read athlete matches"
ON public.athlete_matches
FOR SELECT
TO authenticated, anon
USING (true);

-- 2. performance_metrics
CREATE POLICY "Anyone can read performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated, anon
USING (true);

-- 3. media_gallery
CREATE POLICY "Anyone can read media gallery"
ON public.media_gallery
FOR SELECT
TO authenticated, anon
USING (true);
