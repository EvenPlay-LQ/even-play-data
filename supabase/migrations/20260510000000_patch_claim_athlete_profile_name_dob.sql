-- =====================================================
-- Migration: Patch claim_athlete_profile to sync full_name and date_of_birth
-- Root Cause Fix for: Dashboard data not persisting after signup wizard
-- =====================================================
-- Problem: When a user completes the signup wizard, their confirmed full_name
-- and date_of_birth were NOT being written back to the athletes row via
-- claim_athlete_profile. This meant institution-created stubs retained
-- the institution's input instead of the athlete's own confirmed data.
-- =====================================================

CREATE OR REPLACE FUNCTION public.claim_athlete_profile(
  p_athlete_id     UUID,
  p_profile_id     UUID,
  p_position       TEXT    DEFAULT NULL,
  p_squad          TEXT    DEFAULT NULL,
  p_nationality    TEXT    DEFAULT NULL,
  p_height_cm      NUMERIC DEFAULT NULL,
  p_weight_kg      NUMERIC DEFAULT NULL,
  p_mysafa_id      TEXT    DEFAULT NULL,
  p_playing_style  TEXT    DEFAULT NULL,
  -- NEW: sync the user-confirmed name and DOB from the wizard
  p_full_name      TEXT    DEFAULT NULL,
  p_date_of_birth  DATE    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.athletes SET
    profile_id    = p_profile_id,
    status        = 'claimed',
    -- Use the user's wizard input when provided, otherwise preserve existing
    full_name     = COALESCE(p_full_name, full_name),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    position      = COALESCE(p_position, position),
    squad         = p_squad,
    nationality   = p_nationality,
    height_cm     = p_height_cm,
    weight_kg     = p_weight_kg,
    mysafa_id     = p_mysafa_id,
    playing_style = p_playing_style,
    updated_at    = now()
  WHERE id = p_athlete_id
    AND (profile_id IS NULL OR profile_id = p_profile_id);
END;
$$;

-- Re-grant execute permissions (same as before)
REVOKE EXECUTE ON FUNCTION public.claim_athlete_profile(
  uuid, uuid, text, text, text, numeric, numeric, text, text, text, date
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.claim_athlete_profile(
  uuid, uuid, text, text, text, numeric, numeric, text, text, text, date
) TO authenticated, service_role;

-- Raise a notice so we can confirm in logs
DO $$
BEGIN
  RAISE NOTICE 'claim_athlete_profile patched: full_name and date_of_birth now synced from wizard.';
END;
$$;
