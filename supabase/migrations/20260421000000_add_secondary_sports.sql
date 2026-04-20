-- Migration: Add Secondary Sports Support (Additive Upgrade)
-- Description: Adds a secondary_sports text[] column to allow multi-sport tagging without breaking existing schema or analytics grouping.

-- 1. Add secondary_sports to athletes
ALTER TABLE public.athletes 
ADD COLUMN IF NOT EXISTS secondary_sports text[] DEFAULT '{}'::text[];

-- 2. Drop the old RPC to redefine it with the new signature
DROP FUNCTION IF EXISTS public.find_or_create_athlete(TEXT, DATE, TEXT, TEXT, TEXT, TEXT);

-- 3. Redefine RPC to accept and store p_secondary_sports
CREATE OR REPLACE FUNCTION public.find_or_create_athlete(
  p_full_name TEXT,
  p_date_of_birth DATE,
  p_sport TEXT,
  p_email TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_created_by_role TEXT DEFAULT NULL,
  p_secondary_sports TEXT[] DEFAULT '{}'::text[]
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

  -- Step 2: fall back to name + DOB + primary sport match
  IF v_athlete_id IS NULL THEN
    SELECT id INTO v_athlete_id
    FROM public.athletes
    WHERE lower(full_name) = lower(p_full_name)
      AND date_of_birth = p_date_of_birth
      AND lower(sport) = lower(p_sport) 
      AND status != 'merged'
    LIMIT 1;
  END IF;

  -- Step 3: return existing or insert new
  IF v_athlete_id IS NOT NULL THEN
    v_matched := true;
    -- Optionally, we could append new sports to secondary_sports here if needed:
    -- UPDATE public.athletes SET secondary_sports = ARRAY_CAT(secondary_sports, p_secondary_sports) WHERE id = v_athlete_id;
  ELSE
    INSERT INTO public.athletes (full_name, date_of_birth, sport, position, contact_email, status, secondary_sports)
    VALUES (p_full_name, p_date_of_birth, p_sport, p_position, p_email, 'stub', p_secondary_sports)
    RETURNING id INTO v_athlete_id;
  END IF;

  RETURN json_build_object(
    'athlete_id', v_athlete_id,
    'matched', v_matched
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_or_create_athlete TO authenticated, anon;
