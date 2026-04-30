[
  {
    "name": "materialized_view_in_api",
    "title": "Materialized View in API",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects materialized views that are accessible over the Data APIs.",
    "detail": "Materialized view \\`public.mv_daily_institution_stats\\` is selectable by anon or authenticated roles",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    "metadata": {
      "name": "mv_daily_institution_stats",
      "type": "materialized view",
      "schema": "public"
    },
    "cache_key": "materialized_view_in_api_public_mv_daily_institution_stats"
  },
  {
    "name": "materialized_view_in_api",
    "title": "Materialized View in API",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects materialized views that are accessible over the Data APIs.",
    "detail": "Materialized view \\`public.mv_weekly_performance_trends\\` is selectable by anon or authenticated roles",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    "metadata": {
      "name": "mv_weekly_performance_trends",
      "type": "materialized view",
      "schema": "public"
    },
    "cache_key": "materialized_view_in_api_public_mv_weekly_performance_trends"
  },
  {
    "name": "materialized_view_in_api",
    "title": "Materialized View in API",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects materialized views that are accessible over the Data APIs.",
    "detail": "Materialized view \\`public.mv_monthly_attendance\\` is selectable by anon or authenticated roles",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    "metadata": {
      "name": "mv_monthly_attendance",
      "type": "materialized view",
      "schema": "public"
    },
    "cache_key": "materialized_view_in_api_public_mv_monthly_attendance"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.calculate_match_stats(match_id_param uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/calculate_match_stats`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "calculate_match_stats",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "match_id_param uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_calculate_match_stats_match_id_param uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.check_expiring_documents()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/check_expiring_documents`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "check_expiring_documents",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_check_expiring_documents_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.check_rate_limit(inst_id uuid, endpoint_param text)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/check_rate_limit`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "check_rate_limit",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid, endpoint_param text",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_check_rate_limit_inst_id uuid, endpoint_param text"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.claim_athlete_profile(p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/claim_athlete_profile`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "claim_athlete_profile",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_claim_athlete_profile_p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.find_or_create_athlete(p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[])` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/find_or_create_athlete`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "find_or_create_athlete",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[]",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_find_or_create_athlete_p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[]"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.generate_athlete_export(job_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/generate_athlete_export`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "generate_athlete_export",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "job_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_generate_athlete_export_job_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.generate_performance_insights()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/generate_performance_insights`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "generate_performance_insights",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_generate_performance_insights_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.get_cached_result(cache_key_param text)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_cached_result`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "get_cached_result",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "cache_key_param text",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_get_cached_result_cache_key_param text"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.get_institution_branding(inst_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_institution_branding`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "get_institution_branding",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_get_institution_branding_inst_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.get_team_roster(team_id_param uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_team_roster`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "get_team_roster",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "team_id_param uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_get_team_roster_team_id_param uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.get_user_type(_user_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_user_type`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "get_user_type",
      "schema": "public",
      "language": "sql",
      "arguments": "_user_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_get_user_type__user_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.handle_new_user()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/handle_new_user`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "handle_new_user",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_handle_new_user_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.has_role(_user_id uuid, _role public.app_role)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/has_role`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "has_role",
      "schema": "public",
      "language": "sql",
      "arguments": "_user_id uuid, _role public.app_role",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_has_role__user_id uuid, _role public.app_role"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.log_api_request(inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/log_api_request`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "log_api_request",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_log_api_request_inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.mark_announcement_read(announcement_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/mark_announcement_read`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "mark_announcement_read",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "announcement_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_mark_announcement_read_announcement_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.process_athlete_import(job_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/process_athlete_import`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "process_athlete_import",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "job_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_process_athlete_import_job_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.record_database_metrics()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/record_database_metrics`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "record_database_metrics",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_record_database_metrics_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.refresh_analytics_views()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/refresh_analytics_views`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "refresh_analytics_views",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_refresh_analytics_views_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.rls_auto_enable()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/rls_auto_enable`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "rls_auto_enable",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_rls_auto_enable_"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.set_cached_result(cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/set_cached_result`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "set_cached_result",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_set_cached_result_cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.sync_sis_enrollment(config_id uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/sync_sis_enrollment`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "sync_sis_enrollment",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "config_id uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_sync_sis_enrollment_config_id uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.test_insert_note(test_uid uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/test_insert_note`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "test_insert_note",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "test_uid uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_test_insert_note_test_uid uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.test_select_athletes(test_uid uuid)` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/test_select_athletes`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "test_select_athletes",
      "schema": "public",
      "language": "sql",
      "arguments": "test_uid uuid",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_test_select_athletes_test_uid uuid"
  },
  {
    "name": "anon_security_definer_function_executable",
    "title": "Public Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable without signing in. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if it is not meant to be public.",
    "detail": "Function `public.update_competition_standings()` can be executed by the `anon` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/update_competition_standings`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable",
    "metadata": {
      "name": "update_competition_standings",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "anon_security_definer_function_executable_public_update_competition_standings_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.calculate_match_stats(match_id_param uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/calculate_match_stats`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "calculate_match_stats",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "match_id_param uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_calculate_match_stats_match_id_param uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.check_expiring_documents()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/check_expiring_documents`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "check_expiring_documents",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_check_expiring_documents_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.check_rate_limit(inst_id uuid, endpoint_param text)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/check_rate_limit`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "check_rate_limit",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid, endpoint_param text",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_check_rate_limit_inst_id uuid, endpoint_param text"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.claim_athlete_profile(p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/claim_athlete_profile`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "claim_athlete_profile",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_claim_athlete_profile_p_athlete_id uuid, p_profile_id uuid, p_position text, p_squad text, p_nationality text, p_height_cm numeric, p_weight_kg numeric, p_mysafa_id text, p_playing_style text"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.find_or_create_athlete(p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[])` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/find_or_create_athlete`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "find_or_create_athlete",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[]",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_find_or_create_athlete_p_full_name text, p_date_of_birth date, p_sport text, p_email text, p_position text, p_created_by_role text, p_secondary_sports text[]"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.generate_athlete_export(job_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/generate_athlete_export`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "generate_athlete_export",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "job_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_generate_athlete_export_job_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.generate_performance_insights()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/generate_performance_insights`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "generate_performance_insights",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_generate_performance_insights_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.get_cached_result(cache_key_param text)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_cached_result`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "get_cached_result",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "cache_key_param text",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_get_cached_result_cache_key_param text"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.get_institution_branding(inst_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_institution_branding`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "get_institution_branding",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_get_institution_branding_inst_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.get_team_roster(team_id_param uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_team_roster`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "get_team_roster",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "team_id_param uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_get_team_roster_team_id_param uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.get_user_type(_user_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/get_user_type`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "get_user_type",
      "schema": "public",
      "language": "sql",
      "arguments": "_user_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_get_user_type__user_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.handle_new_user()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/handle_new_user`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "handle_new_user",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_handle_new_user_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.has_role(_user_id uuid, _role public.app_role)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/has_role`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "has_role",
      "schema": "public",
      "language": "sql",
      "arguments": "_user_id uuid, _role public.app_role",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_has_role__user_id uuid, _role public.app_role"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.is_master_admin(_user_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/is_master_admin`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "is_master_admin",
      "schema": "public",
      "language": "sql",
      "arguments": "_user_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_is_master_admin__user_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.log_api_request(inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/log_api_request`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "log_api_request",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_log_api_request_inst_id uuid, user_id uuid, endpoint_param text, method_param text, response_time_param integer, status_param integer"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.mark_announcement_read(announcement_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/mark_announcement_read`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "mark_announcement_read",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "announcement_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_mark_announcement_read_announcement_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.process_athlete_import(job_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/process_athlete_import`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "process_athlete_import",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "job_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_process_athlete_import_job_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.record_database_metrics()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/record_database_metrics`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "record_database_metrics",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_record_database_metrics_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.refresh_analytics_views()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/refresh_analytics_views`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "refresh_analytics_views",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_refresh_analytics_views_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.rls_auto_enable()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/rls_auto_enable`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "rls_auto_enable",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_rls_auto_enable_"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.set_cached_result(cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/set_cached_result`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "set_cached_result",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_set_cached_result_cache_key_param text, query_hash_param text, result_data jsonb, ttl_minutes integer"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.sync_sis_enrollment(config_id uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/sync_sis_enrollment`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "sync_sis_enrollment",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "config_id uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_sync_sis_enrollment_config_id uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.test_insert_note(test_uid uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/test_insert_note`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "test_insert_note",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "test_uid uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_test_insert_note_test_uid uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.test_select_athletes(test_uid uuid)` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/test_select_athletes`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "test_select_athletes",
      "schema": "public",
      "language": "sql",
      "arguments": "test_uid uuid",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_test_select_athletes_test_uid uuid"
  },
  {
    "name": "authenticated_security_definer_function_executable",
    "title": "Signed-In Users Can Execute SECURITY DEFINER Function",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects `SECURITY DEFINER` functions that are callable by signed-in users. Revoke `EXECUTE`, switch the function to `SECURITY INVOKER`, or move it out of your exposed API schema if signed-in users should not call it.",
    "detail": "Function `public.update_competition_standings()` can be executed by the `authenticated` role as a `SECURITY DEFINER` function via `/rest/v1/rpc/update_competition_standings`. Revoke `EXECUTE` or switch it to `SECURITY INVOKER` if that is not intentional.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable",
    "metadata": {
      "name": "update_competition_standings",
      "schema": "public",
      "language": "plpgsql",
      "arguments": "",
      "security_definer": true
    },
    "cache_key": "authenticated_security_definer_function_executable_public_update_competition_standings_"
  },
  {
    "name": "auth_leaked_password_protection",
    "title": "Leaked Password Protection Disabled",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Leaked password protection is currently disabled.",
    "detail": "Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable this feature to enhance security.",
    "cache_key": "auth_leaked_password_protection",
    "remediation": "https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection",
    "metadata": {
      "type": "auth",
      "entity": "Auth"
    }
  }
]