-- =====================================================
-- Verification Script: find_or_create_athlete RPC & Zone Visibility
-- =====================================================
-- Run this in your Supabase SQL Editor to verify the setup
-- =====================================================

-- 1. Verify the RPC function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'find_or_create_athlete';

-- Expected: Should return 1 row showing the function exists

-- 2. Test the RPC function with sample data
-- This simulates what happens during athlete signup
SELECT public.find_or_create_athlete(
  p_full_name := 'Test Athlete',
  p_date_of_birth := '2005-01-15',
  p_sport := 'Football',
  p_email := NULL,
  p_position := 'Midfielder'
) AS result;

-- Expected: Returns JSON with athlete_id and matched status

-- 3. Verify RLS policies on athletes table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'athletes' 
ORDER BY policyname;

-- Expected: Should show at least these policies:
-- - "Anyone can read athletes" (FOR SELECT, USING: true)
-- - "Owners can manage own athlete" (FOR ALL, USING: profile_id = auth.uid())
-- - "Institutions can manage their own athletes" (FOR ALL)
-- - "Master admin full access athletes" (FOR ALL)

-- 4. Verify athletes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'athletes'
ORDER BY ordinal_position;

-- Expected: Should show all columns including:
-- - id, full_name, date_of_birth, sport, position
-- - profile_id, institution_id, status
-- - contact_email (added by RPC migration)
-- - performance_score, level, xp_points

-- 5. Test Zone Page Query (simulating what ZonePage.tsx does)
-- This should return all athletes with their profile data
SELECT 
  a.id,
  a.sport,
  a.position,
  a.level,
  a.xp_points,
  a.performance_score,
  a.profile_id,
  p.name as profile_name,
  p.avatar
FROM public.athletes a
LEFT JOIN public.profiles p ON a.profile_id = p.id
ORDER BY a.performance_score DESC
LIMIT 10;

-- Expected: Should return athletes (both stub and claimed)
-- with or without profile links

-- 6. Check if there are any athletes without proper status
SELECT 
  status,
  COUNT(*) as count
FROM public.athletes
GROUP BY status;

-- Expected: Should show distribution of statuses:
-- stub, claimed, invited, merged

-- 7. Verify profiles table has setup_complete flag
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('setup_complete', 'user_type', 'name');

-- Expected: Should return setup_complete, user_type, and name

-- 8. Check for any blocked queries (debugging)
-- Run this while logged in as a test user:
SELECT 
  current_user,
  session_user,
  has_database_privilege(current_user, 'CONNECT') as can_connect,
  has_schema_privilege(current_user, 'public', 'USAGE') as can_use_public;

-- Expected: Should show proper permissions for authenticated users

-- =====================================================
-- Troubleshooting Notes:
-- =====================================================
-- If RPC function doesn't exist:
--   - Run migration: 20260331160603_find_or_create_athlete_rpc.sql

-- If RLS policies are missing:
--   - Run migration: 20260313125130_c4eabb51-438b-4292-9a85-c12ebd066f43.sql
--   - Run migration: 20260320230000_system_stabilization_rls.sql

-- If athletes don't appear in Zone:
--   1. Check that profile_id is set on the athlete record
--   2. Verify the athlete has a valid status (stub or claimed)
--   3. Ensure RLS policy "Anyone can read athletes" exists
--   4. Check that the user is authenticated when querying

-- If sign-up loop persists:
--   1. Verify profiles.setup_complete is being set to true
--   2. Check that refreshProfile() is called after signup
--   3. Ensure ProtectedRoute allows /buzz access
