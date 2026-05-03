-- ==============================================================================
-- Migration: Restore EXECUTE grants on athlete RPC functions
-- ==============================================================================
-- Root Cause:
-- The security hardening migration (20260429200000_fix_all_security_warnings.sql)
-- REVOKEd and re-GRANTed execute on find_or_create_athlete with signature
-- (text, date, text, text, text, text, text[]) — 7 params.
-- The claim_athlete_profile function never had an explicit GRANT in its
-- original migration (20260415000000_claim_athlete_profile_rpc.sql).
-- This caused "permission denied for function" errors during athlete signup setup.
--
-- This migration performs a clean REVOKE + GRANT cycle on both functions
-- using their exact current signatures to guarantee authenticated users
-- can complete the signup wizard.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. find_or_create_athlete
--    Current signature (7 params, from 20260421000000_add_secondary_sports.sql)
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.find_or_create_athlete(
  TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT[]
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.find_or_create_athlete(
  TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT[]
) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. claim_athlete_profile
--    Current signature (9 params, from 20260415000000_claim_athlete_profile_rpc.sql)
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.claim_athlete_profile(
  UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_athlete_profile(
  UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT
) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. Verify grants are in place (logged, not blocking)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'find_or_create_athlete and claim_athlete_profile grants restored for authenticated role.';
END $$;
