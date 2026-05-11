-- =====================================================
-- Migration: Sync athletes.full_name when profiles.name is updated
-- Root Cause Fix for: User Complaint 4,2 — Zone page shows stale name
-- after user edits their profile name.
-- =====================================================
-- Problem:
--   When an athlete edits their name in Profile, updateProfile() updates
--   profiles.name. The Zone page displays athletes.full_name (or profiles.name
--   via JOIN). Because athletes.full_name is a denormalized copy, it goes
--   stale unless explicitly updated. This trigger keeps them in sync.
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_athlete_fullname_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a profile's name changes, update the linked athlete record's full_name
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.athletes
    SET full_name = NEW.name,
        updated_at = now()
    WHERE profile_id = NEW.id
      AND status = 'claimed';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop first to ensure idempotency
DROP TRIGGER IF EXISTS trg_sync_athlete_fullname ON public.profiles;

CREATE TRIGGER trg_sync_athlete_fullname
  AFTER UPDATE OF name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_athlete_fullname_from_profile();

-- Backfill: ensure existing claimed athletes have current profile name
UPDATE public.athletes a
SET full_name = p.name,
    updated_at = now()
FROM public.profiles p
WHERE a.profile_id = p.id
  AND a.status = 'claimed'
  AND (a.full_name IS DISTINCT FROM p.name OR a.full_name IS NULL);

DO $$
BEGIN
  RAISE NOTICE 'Trigger trg_sync_athlete_fullname created and backfill complete.';
END;
$$;
