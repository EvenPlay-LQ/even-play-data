-- =====================================================
-- Migration: find_or_create_athlete RPC
-- =====================================================

-- 0. Schema Correction: The athletes table did not previously have a contact_email column.
-- This is necessary to satisfy Step 1 of the RPC logic mapping.
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 1. Create the finding / creation RPC
CREATE OR REPLACE FUNCTION public.find_or_create_athlete(
  p_full_name TEXT,
  p_date_of_birth DATE,
  p_sport TEXT,
  p_email TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_created_by_role TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_athlete_id UUID;
  v_matched BOOLEAN := false;
BEGIN
  -- Step 1: try email match first (strongest signal)
  IF p_email IS NOT NULL THEN
    SELECT id INTO v_athlete_id
    FROM public.athletes
    WHERE lower(contact_email) = lower(p_email)
    LIMIT 1;
  END IF;

  -- Step 2: fall back to name + DOB + Sport match
  IF v_athlete_id IS NULL THEN
    SELECT id INTO v_athlete_id
    FROM public.athletes
    WHERE lower(full_name) = lower(p_full_name)
      AND date_of_birth = p_date_of_birth
      AND lower(sport) = lower(p_sport)  -- Added sport to guarantee safety across disciplines
      AND status != 'merged'
    LIMIT 1;
  END IF;

  -- Step 3: return existing or insert new
  IF v_athlete_id IS NOT NULL THEN
    v_matched := true;
  ELSE
    INSERT INTO public.athletes (full_name, date_of_birth, sport, position, contact_email, status)
    VALUES (p_full_name, p_date_of_birth, p_sport, p_position, p_email, 'stub')
    RETURNING id INTO v_athlete_id;
  END IF;

  RETURN json_build_object(
    'athlete_id', v_athlete_id,
    'matched', v_matched
  );
END;
$$;

-- 2. Grant execute to authenticated users and the anon role (for pre-auth wizard calls)
GRANT EXECUTE ON FUNCTION public.find_or_create_athlete TO authenticated, anon;
