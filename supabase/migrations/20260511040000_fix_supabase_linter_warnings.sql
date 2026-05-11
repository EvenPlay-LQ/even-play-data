-- ==============================================================================
-- Migration: Fix Supabase Linter Security Warnings
-- Description: Resolves issues with mutable search_path and public access to
--              SECURITY DEFINER functions as reported by Supabase Linter.
-- ==============================================================================

-- 1. Fix public.find_or_create_athlete
-- Warning: function_search_path_mutable
-- Signature updated to match 20260421000000_add_secondary_sports.sql (7 arguments)
ALTER FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) TO authenticated, anon, service_role;

-- Also fix the older 6-argument version if it still exists in the database
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'find_or_create_athlete' AND pronargs = 6) THEN
    ALTER FUNCTION public.find_or_create_athlete(text, date, text, text, text, text) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text) TO authenticated, anon, service_role;
  END IF;
END;
$$;


-- 2. Fix public.sync_athlete_fullname_from_profile
-- Warning: anon_security_definer_function_executable & authenticated_security_definer_function_executable
-- This is a trigger function and should NOT be executable via RPC.
ALTER FUNCTION public.sync_athlete_fullname_from_profile() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.sync_athlete_fullname_from_profile() FROM PUBLIC;
-- No GRANT needed as triggers run with the permissions of the function creator (SECURITY DEFINER).


-- 3. Fix public.get_platform_stats
-- Warning: authenticated_security_definer_function_executable
-- Function is already protected by is_master_admin() check internally.
-- Setting search_path explicitly and ensuring restrictive grants.
ALTER FUNCTION public.get_platform_stats() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated, service_role;


-- 4. Fix public.claim_athlete_profile
-- Warning: authenticated_security_definer_function_executable
-- This function is called by users during signup. We ensure search_path is set
-- and that it is restricted to authenticated users.
-- Signature matches 20260510000000_patch_claim_athlete_profile_name_dob.sql (11 arguments)
ALTER FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text, text, date) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text, text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text, text, date) TO authenticated, service_role;

-- Also check for the 9-argument version from 20260415000000_claim_athlete_profile_rpc.sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'claim_athlete_profile' AND pronargs = 9) THEN
    ALTER FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text) SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text) TO authenticated, service_role;
  END IF;
END;
$$;


-- 5. Audit other potential leaks (Cleanup)
-- Ensure handle_new_user (auth trigger) is not public
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Raise notice for confirmation
DO $$
BEGIN
  RAISE NOTICE 'Supabase security linter fixes applied successfully.';
END;
$$;
