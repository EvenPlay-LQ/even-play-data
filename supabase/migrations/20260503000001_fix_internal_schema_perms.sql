-- ==============================================================================
-- Migration: Fix internal schema permissions for RPC wrappers
-- ==============================================================================
-- Root Cause:
-- The find_or_create_athlete function in the public schema was set up as a 
-- SECURITY INVOKER wrapper that calls internal.find_or_create_athlete.
-- However, the authenticated role did not have USAGE on the internal schema
-- nor EXECUTE on the internal function, resulting in a "permission denied" error
-- during the athlete signup flow.
-- ==============================================================================

-- 1. Grant USAGE on the internal schema
GRANT USAGE ON SCHEMA internal TO authenticated, anon, service_role;

-- 2. Grant EXECUTE on the internal function
GRANT EXECUTE ON FUNCTION internal.find_or_create_athlete(
  TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT[]
) TO authenticated, service_role;

-- 3. Also grant EXECUTE to anon if needed (commented out by default to be safe)
-- GRANT EXECUTE ON FUNCTION internal.find_or_create_athlete(TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO anon;
