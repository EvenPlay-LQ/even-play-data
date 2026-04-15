-- =====================================================
-- Migration: Critical Blockers Fix
-- Date: 2026-04-08
-- Fixes:
--   1. Add metadata JSONB column to bulk_import_jobs so
--      process_athlete_import() no longer crashes on missing field
--   2. Fix process_athlete_import to read from the metadata column
--   3. Create athlete_media storage bucket (via policy helper)
-- =====================================================

-- ── 1. Add missing metadata column to bulk_import_jobs ──────────────
ALTER TABLE public.bulk_import_jobs
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.bulk_import_jobs.metadata IS
  'Arbitrary JSON payload used during processing (e.g. parsed CSV rows stored as {rows: [...]} by the upload handler)';

-- ── 2. Replace process_athlete_import to use the metadata column ─────
-- The original function referenced job_record.metadata which didn't exist,
-- causing it to always throw. This version safely reads from the new column.
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
  -- Fetch job
  SELECT * INTO job_record FROM public.bulk_import_jobs WHERE id = job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bulk import job not found: %', job_id;
  END IF;

  -- Mark as processing
  UPDATE public.bulk_import_jobs
  SET status = 'processing', started_at = now()
  WHERE id = job_id;

  -- Guard: metadata must contain a "rows" array
  IF job_record.metadata IS NULL OR job_record.metadata -> 'rows' IS NULL THEN
    UPDATE public.bulk_import_jobs
    SET
      status = 'failed',
      error_log = '[{"error": "metadata.rows is missing or null — upload handler must populate this field"}]'::jsonb,
      completed_at = now()
    WHERE id = job_id;
    RETURN;
  END IF;

  -- Process each row
  FOR athlete_data, row_number IN
    SELECT value, ordinality
    FROM jsonb_array_elements(job_record.metadata -> 'rows')
    WITH ORDINALITY AS t(value, ordinality)
  LOOP
    BEGIN
      -- Validate required fields
      IF (athlete_data ->> 'name') IS NULL OR (athlete_data ->> 'email') IS NULL THEN
        error_details := error_details || jsonb_build_object(
          'row', row_number,
          'error', 'Missing required fields: name or email',
          'data', athlete_data
        );
        fail_count := fail_count + 1;
        CONTINUE;
      END IF;

      -- Check for duplicate email within this institution
      IF EXISTS (
        SELECT 1 FROM public.athletes
        WHERE contact_email = LOWER(athlete_data ->> 'email')
          AND institution_id = job_record.institution_id
      ) THEN
        error_details := error_details || jsonb_build_object(
          'row', row_number,
          'error', 'Duplicate email',
          'email', athlete_data ->> 'email'
        );
        fail_count := fail_count + 1;
        CONTINUE;
      END IF;

      -- Insert stub athlete
      INSERT INTO public.athletes (
        full_name,
        contact_email,
        institution_id,
        sport,
        position,
        date_of_birth,
        status
      ) VALUES (
        athlete_data ->> 'name',
        LOWER(athlete_data ->> 'email'),
        job_record.institution_id,
        COALESCE(athlete_data ->> 'sport', 'Football'),
        athlete_data ->> 'position',
        NULLIF(athlete_data ->> 'date_of_birth', ''),
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

  -- Write results
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
      'success_count', success_count,
      'fail_count', fail_count,
      'success_rate', ROUND(
        success_count::numeric / NULLIF(success_count + fail_count, 0) * 100, 2
      )
    ),
    completed_at = now()
  WHERE id = job_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. athlete_media storage bucket ─────────────────────────────────
-- Supabase storage buckets cannot be created via SQL migrations directly
-- in managed Supabase projects (they must be created via the Dashboard or
-- the management API). However, we can ensure the RLS policies that the
-- application code relies on are in place for when the bucket exists.
--
-- ACTION REQUIRED: Create the 'athlete_media' bucket in Supabase Dashboard:
--   Storage → New Bucket → Name: athlete_media → Public: true
--
-- The policies below will take effect once the bucket exists.

-- Allow authenticated users to upload to athlete_media
DO $$
BEGIN
  -- Only create if the storage schema exists (it always does in Supabase)
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN

    -- Upload policy: authenticated users can upload to athlete_media
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'athlete_media_upload_policy'
    ) THEN
      CREATE POLICY "athlete_media_upload_policy"
        ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'athlete_media');
    END IF;

    -- Read policy: public can read athlete_media files
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'athlete_media_read_policy'
    ) THEN
      CREATE POLICY "athlete_media_read_policy"
        ON storage.objects
        FOR SELECT TO public
        USING (bucket_id = 'athlete_media');
    END IF;

    -- Delete policy: only uploader can delete their files
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'athlete_media_delete_policy'
    ) THEN
      CREATE POLICY "athlete_media_delete_policy"
        ON storage.objects
        FOR DELETE TO authenticated
        USING (bucket_id = 'athlete_media' AND auth.uid() = owner);
    END IF;

  END IF;
END $$;

-- ── 4. Grant execute on fixed function ──────────────────────────────
GRANT EXECUTE ON FUNCTION public.process_athlete_import(UUID) TO authenticated;
