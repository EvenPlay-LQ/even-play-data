-- RPC to claim an athlete record during signup wizard.
-- Needed because the athletes RLS UPDATE policy requires profile_id = auth.uid(),
-- but profile_id is NULL on a fresh stub record, so a direct client-side update
-- silently affects 0 rows. This SECURITY DEFINER function bypasses RLS.

CREATE OR REPLACE FUNCTION public.claim_athlete_profile(
  p_athlete_id UUID,
  p_profile_id UUID,
  p_position TEXT DEFAULT NULL,
  p_squad TEXT DEFAULT NULL,
  p_nationality TEXT DEFAULT NULL,
  p_height_cm NUMERIC DEFAULT NULL,
  p_weight_kg NUMERIC DEFAULT NULL,
  p_mysafa_id TEXT DEFAULT NULL,
  p_playing_style TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.athletes SET
    profile_id = p_profile_id,
    status = 'claimed',
    position = COALESCE(p_position, position),
    squad = p_squad,
    nationality = p_nationality,
    height_cm = p_height_cm,
    weight_kg = p_weight_kg,
    mysafa_id = p_mysafa_id,
    playing_style = p_playing_style
  WHERE id = p_athlete_id
    AND (profile_id IS NULL OR profile_id = p_profile_id);
END;
$$;
