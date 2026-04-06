-- =====================================================
-- Migration: Institutional Features Phase 4
-- Description: Scale, integrations, white-label, performance
-- Date: 2026-04-02
-- =====================================================

-- ==================== PHASE 4: BULK OPERATIONS ====================

-- 1. Bulk Import Jobs Table
CREATE TABLE IF NOT EXISTS public.bulk_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('athletes', 'teams', 'matches', 'documents')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  result_summary JSONB,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bulk_import_jobs_institution ON public.bulk_import_jobs(institution_id);
CREATE INDEX idx_bulk_import_jobs_status ON public.bulk_import_jobs(status);
CREATE INDEX idx_bulk_import_jobs_created ON public.bulk_import_jobs(created_at);

-- 2. Bulk Export Jobs Table
CREATE TABLE IF NOT EXISTS public.bulk_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('athletes', 'teams', 'matches', 'attendance', 'documents', 'analytics')),
  format TEXT DEFAULT 'csv' CHECK (format IN ('csv', 'xlsx', 'json', 'pdf')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  filters JSONB, -- { "sport": "Football", "date_from": "2026-01-01" }
  file_url TEXT,
  file_name TEXT,
  record_count INTEGER,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bulk_export_jobs_institution ON public.bulk_export_jobs(institution_id);
CREATE INDEX idx_bulk_export_jobs_status ON public.bulk_export_jobs(status);

-- 3. Function to Process Bulk Athlete Import
CREATE OR REPLACE FUNCTION public.process_athlete_import(job_id UUID)
RETURNS void AS $$
DECLARE
  job_record RECORD;
  athlete_data JSONB;
  success_count INTEGER := 0;
  fail_count INTEGER := 0;
  error_details JSONB := '[]'::jsonb;
  row_number INTEGER := 0;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.bulk_import_jobs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
  
  -- Update status to processing
  UPDATE public.bulk_import_jobs 
  SET status = 'processing', started_at = now()
  WHERE id = job_id;
  
  -- Parse CSV data from storage (simplified - in production use proper CSV parser)
  -- This assumes JSONB array stored in metadata during upload
  FOR athlete_data, row_number IN 
    SELECT value, ordinality 
    FROM jsonb_array_elements(job_record.metadata->'rows') WITH ORDINALITY AS t(value, ordinality)
  LOOP
    BEGIN
      -- Validate required fields
      IF athlete_data->>'name' IS NULL OR athlete_data->>'email' IS NULL THEN
        error_details := error_details || jsonb_build_object(
          'row', row_number,
          'error', 'Missing required fields: name or email',
          'data', athlete_data
        );
        fail_count := fail_count + 1;
        CONTINUE;
      END IF;
      
      -- Check for duplicate email
      IF EXISTS (
        SELECT 1 FROM public.athletes 
        WHERE contact_email = LOWER(athlete_data->>'email')
          AND institution_id = job_record.institution_id
      ) THEN
        error_details := error_details || jsonb_build_object(
          'row', row_number,
          'error', 'Duplicate email',
          'email', athlete_data->>'email'
        );
        fail_count := fail_count + 1;
        CONTINUE;
      END IF;
      
      -- Insert athlete
      INSERT INTO public.athletes (
        full_name,
        contact_email,
        institution_id,
        sport,
        position,
        date_of_birth,
        status
      ) VALUES (
        athlete_data->>'name',
        LOWER(athlete_data->>'email'),
        job_record.institution_id,
        COALESCE(athlete_data->>'sport', 'Football'),
        athlete_data->>'position',
        NULLIF(athlete_data->>'date_of_birth', ''),
        'stub'
      );
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_details := error_details || jsonb_build_object(
        'row', row_number,
        'error', SQLERRM,
        'data', athlete_data
      );
      fail_count := fail_count + 1;
    END;
  END LOOP;
  
  -- Update job with results
  UPDATE public.bulk_import_jobs 
  SET 
    status = CASE 
      WHEN fail_count = 0 THEN 'completed'
      WHEN success_count > 0 THEN 'partial'
      ELSE 'failed'
    END,
    processed_rows = success_count + fail_count,
    successful_rows = success_count,
    failed_rows = fail_count,
    error_log = error_details,
    result_summary = jsonb_build_object(
      'success_rate', ROUND(success_count::numeric / NULLIF(success_count + fail_count, 0) * 100, 2),
      'errors_count', jsonb_array_length(error_details)
    ),
    completed_at = now()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to Generate Bulk Export
CREATE OR REPLACE FUNCTION public.generate_athlete_export(job_id UUID)
RETURNS void AS $$
DECLARE
  job_record RECORD;
  export_data JSONB;
  file_path TEXT;
  file_name TEXT;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.bulk_export_jobs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Export job not found';
  END IF;
  
  -- Update status to processing
  UPDATE public.bulk_export_jobs 
  SET status = 'processing'
  WHERE id = job_id;
  
  -- Build query based on filters
  EXECUTE format(
    $sql$
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT 
        a.full_name,
        a.contact_email,
        a.sport,
        a.position,
        a.date_of_birth,
        a.performance_score,
        a.level,
        i.team_name as current_team,
        COUNT(DISTINCT ar.id) as attendance_count,
        AVG(CASE WHEN ar.status = 'present' THEN 1.0 ELSE 0.0 END) * 100 as attendance_rate,
        COUNT(DISTINCT cf.id) as feedback_count,
        AVG(cf.rating) as avg_rating
      FROM athletes a
      LEFT JOIN institutions i ON i.id = a.institution_id
      LEFT JOIN attendance_records ar ON ar.athlete_id = a.id
      LEFT JOIN coach_feedback cf ON cf.athlete_id = a.id
      WHERE a.institution_id = %L
        %s -- Sport filter
        %s -- Date filter
      GROUP BY a.id, i.team_name
    ) t
    $sql$,
    job_record.institution_id,
    CASE 
      WHEN job_record.filters->>'sport' IS NOT NULL 
      THEN format('AND a.sport = %L', job_record.filters->>'sport')
      ELSE ''
    END,
    CASE 
      WHEN job_record.filters->>'created_after' IS NOT NULL 
      THEN format('AND a.created_at > %L', job_record.filters->>'created_after')
      ELSE ''
    END
  ) INTO export_data;
  
  -- Generate file name
  file_name := format('athletes_export_%s_%s.csv', 
                      job_record.institution_id, 
                      to_char(now(), 'YYYYMMDD_HH24MISS'));
  file_path := format('exports/%s/%s', job_record.institution_id, file_name);
  
  -- In production: Convert JSONB to CSV and upload to storage
  -- For now, store JSONB result
  UPDATE public.bulk_export_jobs 
  SET 
    status = 'completed',
    file_url = file_path, -- Would be actual storage URL
    file_name = file_name,
    record_count = jsonb_array_length(export_data),
    expires_at = now() + INTERVAL '7 days'
  WHERE id = job_id;
  
EXCEPTION WHEN OTHERS THEN
  UPDATE public.bulk_export_jobs 
  SET status = 'failed', error_message = SQLERRM
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PHASE 4: THIRD-PARTY INTEGRATIONS ====================

-- 5. Integration Configurations Table
CREATE TABLE IF NOT EXISTS public.integration_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN (
    'sis_power_school', 
    'sis_infinite_campus', 
    'payment_stripe', 
    'payment_paypal', 
    'video_hudl', 
    'video_youtube',
    'wearable_catapult',
    'wearable_statSports',
    'communication_twilio',
    'email_sendgrid'
  )),
  configuration_name TEXT NOT NULL,
  api_credentials JSONB NOT NULL, -- Encrypted in production
  webhook_url TEXT,
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'success', 'warning', 'error')),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, integration_type)
);

CREATE INDEX idx_integration_configurations_institution ON public.integration_configurations(institution_id);

-- 6. Integration Sync Logs
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID REFERENCES public.integration_configurations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  records_processed INTEGER,
  records_created INTEGER,
  records_updated INTEGER,
  records_failed INTEGER,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_integration_sync_logs_configuration ON public.integration_sync_logs(configuration_id);
CREATE INDEX idx_integration_sync_logs_created ON public.integration_sync_logs(created_at);

-- 7. Function: Sync Student Information System (Generic)
CREATE OR REPLACE FUNCTION public.sync_sis_enrollment(config_id UUID)
RETURNS INTEGER AS $$
DECLARE
  config_record RECORD;
  student_data JSONB;
  synced_count INTEGER := 0;
BEGIN
  SELECT * INTO config_record 
  FROM public.integration_configurations 
  WHERE id = config_id AND integration_type LIKE 'sis_%';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SIS configuration not found';
  END IF;
  
  -- In production: Call external SIS API using stored credentials
  -- This is a placeholder for the actual API integration
  
  -- Example: Fetch students from SIS
  -- student_data := sis_api.get_students(config_record.api_credentials);
  
  -- Process each student
  FOR student_data IN SELECT * FROM jsonb_array_elements(config_record.metadata->'students')
  LOOP
    -- Match by student ID or create new athlete record
    INSERT INTO public.athletes (
      full_name,
      contact_email,
      institution_id,
      sport,
      grade,
      student_id_external
    ) VALUES (
      student_data->>'name',
      LOWER(student_data->>'email'),
      config_record.institution_id,
      'Multi-Sport',
      (student_data->>'grade')::integer,
      student_data->>'sis_id'
    )
    ON CONFLICT (student_id_external) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      grade = EXCLUDED.grade,
      last_sync_at = now();
    
    synced_count := synced_count + 1;
  END LOOP;
  
  -- Log sync
  INSERT INTO public.integration_sync_logs (
    configuration_id,
    sync_type,
    records_processed,
    records_created,
    records_updated,
    duration_ms
  ) VALUES (
    config_id,
    'sis_enrollment',
    synced_count,
    0, -- Would track actual creates/updates
    0,
    0
  );
  
  -- Update config last sync
  UPDATE public.integration_configurations
  SET last_sync_at = now(), sync_status = 'success'
  WHERE id = config_id;
  
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PHASE 4: WHITE-LABEL CUSTOMIZATION ====================

-- 8. Institution Branding Table
CREATE TABLE IF NOT EXISTS public.institution_branding (
  institution_id UUID PRIMARY KEY REFERENCES public.institutions(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5', -- Indigo-600
  secondary_color TEXT DEFAULT '#0EA5E9', -- Sky-500
  accent_color TEXT,
  custom_domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  email_signature_html TEXT,
  welcome_message TEXT,
  custom_css TEXT,
  hide_even_playground_branding BOOLEAN DEFAULT false,
  custom_terms_url TEXT,
  custom_privacy_url TEXT,
  social_media_links JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_institution_branding_domain ON public.institution_branding(custom_domain);
CREATE INDEX idx_institution_branding_subdomain ON public.institution_branding(subdomain);

-- 9. Custom Registration Forms
CREATE TABLE IF NOT EXISTS public.custom_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('athlete_registration', 'parent_registration', 'document_upload')),
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'number', 'date', 'select', 'textarea', 'file')),
  field_options JSONB, -- For select type: ["Option 1", "Option 2"]
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER,
  validation_regex TEXT,
  help_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_custom_form_fields_institution ON public.custom_form_fields(institution_id);

-- 10. Function: Apply Custom Branding
CREATE OR REPLACE FUNCTION public.get_institution_branding(inst_id UUID)
RETURNS TABLE (
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  custom_css TEXT,
  hide_branding BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ib.logo_url,
    ib.primary_color,
    ib.secondary_color,
    ib.custom_css,
    ib.hide_even_playground_branding
  FROM public.institution_branding ib
  WHERE ib.institution_id = inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PHASE 4: PERFORMANCE OPTIMIZATION ====================

-- 11. Materialized Views for Heavy Analytics Queries

-- Daily Institution Stats Snapshot
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_institution_stats AS
SELECT 
  i.id as institution_id,
  i.profile_id,
  CURRENT_DATE as stat_date,
  COUNT(DISTINCT a.id) as total_athletes,
  COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_athletes,
  COUNT(DISTINCT t.id) as total_teams,
  COUNT(DISTINCT mf.id) as total_matches,
  COUNT(DISTINCT ast.id) as total_sessions,
  ROUND(AVG(a.performance_score), 2) as avg_performance_score,
  COUNT(DISTINCT ad.id) as total_documents,
  COUNT(CASE WHEN ad.verification_status = 'verified' THEN 1 END) as verified_documents,
  COUNT(CASE WHEN ad.expiry_date < CURRENT_DATE THEN 1 END) as expired_documents
FROM institutions i
LEFT JOIN athletes a ON a.institution_id = i.id
LEFT JOIN teams t ON t.institution_id = i.id
LEFT JOIN match_fixtures mf ON (mf.home_team_id = t.id OR mf.away_team_id = t.id)
LEFT JOIN attendance_sessions ast ON ast.institution_id = i.id
LEFT JOIN athlete_documents ad ON ad.athlete_id = a.id
GROUP BY i.id, i.profile_id;

CREATE UNIQUE INDEX idx_mv_daily_stats_institution_date ON public.mv_daily_institution_stats(institution_id, stat_date);
CREATE INDEX idx_mv_daily_stats_date ON public.mv_daily_institution_stats(stat_date);

-- Weekly Performance Trends
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_weekly_performance_trends AS
SELECT 
  DATE_TRUNC('week', cf.created_at) as week_start,
  a.sport,
  a.institution_id,
  COUNT(*) as feedback_count,
  ROUND(AVG(cf.rating), 2) as avg_rating,
  ROUND(AVG(a.performance_score), 2) as avg_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cf.rating) as median_rating
FROM coach_feedback cf
JOIN athletes a ON a.id = cf.athlete_id
GROUP BY DATE_TRUNC('week', cf.created_at), a.sport, a.institution_id;

CREATE UNIQUE INDEX idx_mv_weekly_trends ON public.mv_weekly_performance_trends(week_start, sport, institution_id);

-- Monthly Attendance Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_monthly_attendance AS
SELECT 
  DATE_TRUNC('month', ast.session_date) as month_start,
  ast.institution_id,
  ast.session_type,
  COUNT(DISTINCT ast.id) as total_sessions,
  COUNT(ar.id) as total_records,
  ROUND(COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::numeric / NULLIF(COUNT(ar.id), 0) * 100, 2) as attendance_rate
FROM attendance_sessions ast
LEFT JOIN attendance_records ar ON ar.session_id = ast.id
GROUP BY DATE_TRUNC('month', ast.session_date), ast.institution_id, ast.session_type;

CREATE UNIQUE INDEX idx_mv_monthly_attendance ON public.mv_monthly_attendance(month_start, institution_id, session_type);

-- 12. Function to Refresh Materialized Views
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_institution_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_weekly_performance_trends;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_monthly_attendance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule to run daily via pg_cron (requires superuser)
-- SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_analytics_views()');

-- 13. Query Result Caching Table
CREATE TABLE IF NOT EXISTS public.query_cache (
  cache_key TEXT PRIMARY KEY,
  query_hash TEXT NOT NULL,
  result_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_query_cache_expires ON public.query_cache(expires_at);
CREATE INDEX idx_query_cache_hash ON public.query_cache(query_hash);

-- 14. Function: Get Cached Query Result
CREATE OR REPLACE FUNCTION public.get_cached_result(cache_key_param TEXT)
RETURNS JSONB AS $$
DECLARE
  cached_result JSONB;
BEGIN
  SELECT result_data INTO cached_result
  FROM public.query_cache
  WHERE cache_key = cache_key_param
    AND expires_at > now();
  
  IF FOUND THEN
    UPDATE public.query_cache
    SET access_count = access_count + 1,
        last_accessed = now()
    WHERE cache_key = cache_key_param;
    
    RETURN cached_result;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Function: Set Cached Query Result
CREATE OR REPLACE FUNCTION public.set_cached_result(
  cache_key_param TEXT,
  query_hash_param TEXT,
  result_data JSONB,
  ttl_minutes INTEGER DEFAULT 60
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.query_cache (
    cache_key,
    query_hash,
    result_data,
    expires_at
  ) VALUES (
    cache_key_param,
    query_hash_param,
    result_data,
    now() + (ttl_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    result_data = EXCLUDED.result_data,
    expires_at = EXCLUDED.expires_at,
    access_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PHASE 4: RATE LIMITING & QUOTAS ====================

-- 16. API Rate Limiting Configuration
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  endpoint_pattern TEXT NOT NULL, -- e.g., '/api/bulk-import', '/api/export'
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  burst_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_rate_limits_institution ON public.api_rate_limits(institution_id);

-- 17. API Usage Tracking
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_api_usage_logs_institution ON public.api_usage_logs(institution_id);
CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_endpoint ON public.api_usage_logs(endpoint);

-- 18. Function: Check Rate Limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(inst_id UUID, endpoint_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  minute_count INTEGER;
  hour_count INTEGER;
  day_count INTEGER;
  limit_record RECORD;
BEGIN
  -- Get rate limit config
  SELECT * INTO limit_record
  FROM public.api_rate_limits
  WHERE institution_id = inst_id
    AND endpoint_pattern = endpoint_param
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- No limit configured
  END IF;
  
  -- Count requests in last minute
  SELECT COUNT(*) INTO minute_count
  FROM public.api_usage_logs
  WHERE institution_id = inst_id
    AND endpoint = endpoint_param
    AND created_at > (now() - INTERVAL '1 minute');
  
  -- Count requests in last hour
  SELECT COUNT(*) INTO hour_count
  FROM public.api_usage_logs
  WHERE institution_id = inst_id
    AND endpoint = endpoint_param
    AND created_at > (now() - INTERVAL '1 hour');
  
  -- Count requests in last day
  SELECT COUNT(*) INTO day_count
  FROM public.api_usage_logs
  WHERE institution_id = inst_id
    AND endpoint = endpoint_param
    AND created_at > (now() - INTERVAL '1 day');
  
  -- Check limits
  IF minute_count >= limit_record.requests_per_minute THEN
    RETURN FALSE;
  END IF;
  
  IF hour_count >= limit_record.requests_per_hour THEN
    RETURN FALSE;
  END IF;
  
  IF day_count >= limit_record.requests_per_day THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Function: Log API Request
CREATE OR REPLACE FUNCTION public.log_api_request(
  inst_id UUID,
  user_id UUID,
  endpoint_param TEXT,
  method_param TEXT,
  response_time_param INTEGER,
  status_param INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.api_usage_logs (
    institution_id,
    user_id,
    endpoint,
    method,
    response_time_ms,
    status_code
  ) VALUES (
    inst_id,
    user_id,
    endpoint_param,
    method_param,
    response_time_param,
    status_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PHASE 4: ADMIN SCALING TOOLS ====================

-- 20. System Health Metrics Table
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  unit TEXT,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_system_health_metrics_name ON public.system_health_metrics(metric_name);
CREATE INDEX idx_system_health_metrics_recorded ON public.system_health_metrics(recorded_at);

-- 21. Audit Trail for Admin Actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'bulk_operation'
  affected_table TEXT,
  affected_record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action_type);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at);

-- 22. Function: Track Database Size Growth
CREATE OR REPLACE FUNCTION public.record_database_metrics()
RETURNS void AS $$
DECLARE
  db_size_bytes BIGINT;
  table_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Get database size
  SELECT pg_database_size(current_database()) INTO db_size_bytes;
  
  -- Record metric
  INSERT INTO public.system_health_metrics (
    metric_name,
    metric_value,
    unit,
    threshold_warning,
    threshold_critical
  ) VALUES (
    'database_size',
    db_size_bytes,
    'bytes',
    10737418240, -- 10 GB warning
    53687091200, -- 50 GB critical
  );
  
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public';
  
  INSERT INTO public.system_health_metrics (
    metric_name,
    metric_value,
    unit
  ) VALUES (
    'table_count',
    table_count,
    'count'
  );
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  INSERT INTO public.system_health_metrics (
    metric_name,
    metric_value,
    unit
  ) VALUES (
    'index_count',
    index_count,
    'count'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 23. Grant Permissions
GRANT SELECT ON public.bulk_import_jobs TO authenticated;
GRANT SELECT ON public.bulk_export_jobs TO authenticated;
GRANT SELECT ON public.integration_configurations TO authenticated;
GRANT SELECT ON public.institution_branding TO authenticated;
GRANT SELECT ON public.custom_form_fields TO authenticated;
GRANT SELECT ON public.mv_daily_institution_stats TO authenticated;
GRANT SELECT ON public.mv_weekly_performance_trends TO authenticated;
GRANT SELECT ON public.mv_monthly_attendance TO authenticated;
GRANT SELECT ON public.query_cache TO authenticated;
GRANT SELECT ON public.api_rate_limits TO authenticated;
GRANT SELECT ON public.api_usage_logs TO authenticated;
GRANT SELECT ON public.system_health_metrics TO authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;

-- 24. Comments for Documentation
COMMENT ON TABLE public.bulk_import_jobs IS 'Track bulk CSV import operations for athletes, teams, and matches';
COMMENT ON TABLE public.bulk_export_jobs IS 'Manage bulk data exports in various formats with configurable filters';
COMMENT ON TABLE public.integration_configurations IS 'Third-party integration settings for SIS, payment, video platforms';
COMMENT ON TABLE public.institution_branding IS 'White-label customization including logos, colors, and custom domains';
COMMENT ON TABLE public.custom_form_fields IS 'Customizable registration forms per institution';
COMMENT ON MATERIALIZED VIEW public.mv_daily_institution_stats IS 'Daily snapshot of institution metrics for fast dashboard loading';
COMMENT ON MATERIALIZED VIEW public.mv_weekly_performance_trends IS 'Weekly aggregated performance trends for analytics';
COMMENT ON MATERIALIZED VIEW public.mv_monthly_attendance IS 'Monthly attendance summary with rates by session type';
COMMENT ON TABLE public.query_cache IS 'Short-term cache for expensive query results';
COMMENT ON TABLE public.api_rate_limits IS 'Configurable rate limits per institution and endpoint';
COMMENT ON TABLE public.api_usage_logs IS 'API request tracking for monitoring and billing';
COMMENT ON TABLE public.system_health_metrics IS 'Database health metrics and growth tracking';
COMMENT ON TABLE public.admin_audit_log IS 'Audit trail for administrative actions and data changes';
