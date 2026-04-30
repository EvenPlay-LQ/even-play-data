-- ==============================================================================
-- SUPABASE SECURITY HARDENING MIGRATION
-- Resolves warnings from Supabase Security Advisor (Function Search Paths,
-- Security Definer Views, API-exposed Materialized Views, permissive RLS,
-- public bucket listing, and overly permissive function executions).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Fix Mutable Search Paths on Functions (SECURITY DEFINER Best Practice)
-- ------------------------------------------------------------------------------
ALTER FUNCTION public.test_select_athletes(uuid) SET search_path = public;
ALTER FUNCTION public.test_insert_note(uuid) SET search_path = public;
ALTER FUNCTION public.mark_announcement_read(uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_expired_announcements() SET search_path = public;
ALTER FUNCTION public.get_team_roster(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_match_stats(uuid) SET search_path = public;
ALTER FUNCTION public.update_competition_standings() SET search_path = public;
ALTER FUNCTION public.check_expiring_documents() SET search_path = public;
ALTER FUNCTION public.generate_performance_insights() SET search_path = public;
ALTER FUNCTION public.generate_athlete_export(uuid) SET search_path = public;
ALTER FUNCTION public.sync_sis_enrollment(uuid) SET search_path = public;
ALTER FUNCTION public.get_institution_branding(uuid) SET search_path = public;
ALTER FUNCTION public.refresh_analytics_views() SET search_path = public;
ALTER FUNCTION public.get_cached_result(text) SET search_path = public;
ALTER FUNCTION public.set_cached_result(text, text, jsonb, integer) SET search_path = public;
ALTER FUNCTION public.check_rate_limit(uuid, text) SET search_path = public;
ALTER FUNCTION public.log_api_request(uuid, uuid, text, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.record_database_metrics() SET search_path = public;
ALTER FUNCTION public.process_athlete_import(uuid) SET search_path = public;
ALTER FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. Restrict Execution of SECURITY DEFINER Functions from PUBLIC
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.calculate_match_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_match_stats(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.check_expiring_documents() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_expiring_documents() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_athlete_profile(uuid, uuid, text, text, text, numeric, numeric, text, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_or_create_athlete(text, date, text, text, text, text, text[]) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_athlete_export(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_athlete_export(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_performance_insights() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_performance_insights() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_cached_result(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cached_result(text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_institution_branding(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_institution_branding(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_team_roster(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_team_roster(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_type(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_type(uuid) TO authenticated, service_role;

-- handle_new_user is an auth trigger, prevent any API user from manually calling it
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_master_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.log_api_request(uuid, uuid, text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_api_request(uuid, uuid, text, text, integer, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.mark_announcement_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_announcement_read(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.process_athlete_import(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_athlete_import(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.record_database_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_database_metrics() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.refresh_analytics_views() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_analytics_views() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.set_cached_result(text, text, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_cached_result(text, text, jsonb, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.sync_sis_enrollment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_sis_enrollment(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.test_insert_note(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.test_insert_note(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.test_select_athletes(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.test_select_athletes(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_competition_standings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_competition_standings() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. Fix Security Definer Views
-- ------------------------------------------------------------------------------
ALTER VIEW public.v_parent_dashboard SET (security_invoker = true);
ALTER VIEW public.v_athlete_performance_trends SET (security_invoker = true);
ALTER VIEW public.public_athlete_profiles SET (security_invoker = true);
ALTER VIEW public.v_institution_engagement SET (security_invoker = true);

-- ------------------------------------------------------------------------------
-- 4. Secure Materialized Views (Remove API Access)
-- ------------------------------------------------------------------------------
REVOKE ALL ON public.mv_daily_institution_stats FROM anon, authenticated;
REVOKE ALL ON public.mv_weekly_performance_trends FROM anon, authenticated;
REVOKE ALL ON public.mv_monthly_attendance FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 5. Fix Overly Permissive RLS Policy
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can manage insights" ON public.ai_insights;

-- ------------------------------------------------------------------------------
-- 6. Restrict Public Bucket Directory Listing
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Access athlete_media" ON storage.objects;
DROP POLICY IF EXISTS "athlete_media_read_policy" ON storage.objects;
